package com.aalliswell.service;

import com.aalliswell.dto.user.ProfileUpdateRequest;
import com.aalliswell.dto.user.UserProfileDto;
import com.aalliswell.entity.Baby;
import com.aalliswell.entity.DietPreferences;
import com.aalliswell.entity.EmergencyContact;
import com.aalliswell.entity.Lifestyle;
import com.aalliswell.entity.MedicalCondition;
import com.aalliswell.entity.PregnancyProfile;
import com.aalliswell.entity.User;
import com.aalliswell.enums.Role;
import com.aalliswell.exception.EmailAlreadyExistsException;
import com.aalliswell.exception.ResourceNotFoundException;
import com.aalliswell.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long id) {
        return UserProfileDto.from(findById(id));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getPublicProfile(Long id) {
        User user = findById(id);
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUid(String.valueOf(user.getId()));
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name().toLowerCase());
        dto.setSpecialization(user.getSpecialization());
        dto.setClinicName(user.getClinicName());
        dto.setProfileCompleted(user.isProfileCompleted());
        return dto;
    }

    @Transactional
    public UserProfileDto updateProfile(Long id, ProfileUpdateRequest request) {
        User user = findById(id);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase();
            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new EmailAlreadyExistsException("Email is already registered");
            }
            user.setEmail(email);
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getRole() != null) {
            user.setRole(EnumParser.parse(Role.class, request.getRole(), user.getRole()));
        }
        setIfNotNull(request.getLanguage(), user::setLanguage);
        setIfNotNull(request.getAge(), user::setAge);
        setIfNotNull(request.getHeight(), user::setHeight);
        setIfNotNull(request.getWeight(), user::setWeight);
        setIfNotNull(request.getBloodGroup(), user::setBloodGroup);
        setIfNotNull(request.getJoinCode(), user::setJoinCode);
        setIfNotNull(request.getDoctorRoomId(), user::setDoctorRoomId);
        setIfNotNull(request.getSpecialization(), user::setSpecialization);
        setIfNotNull(request.getClinicName(), user::setClinicName);

        String doctorId = request.getDoctorId() != null ? request.getDoctorId() : request.getAssignedDoctorId();
        if (doctorId != null && !doctorId.isBlank()) {
            user.setDoctor(findById(EnumParser.parseId(doctorId, "doctorId")));
        }

        applyEmergencyContact(user, request);
        applyMedicalCondition(user, request);
        applyPregnancyProfile(user, request);
        applyBaby(user, request);
        applyLifestyle(user, request);
        applyDietPreferences(user, request);

        user.setProfileCompleted(true);
        return UserProfileDto.from(userRepository.save(user));
    }

    @Transactional
    public void updateFcmToken(Long id, String fcmToken, String timezone) {
        User user = findById(id);
        user.setFcmToken(fcmToken);
        if (timezone != null && !timezone.isBlank()) {
            user.setTimezone(timezone);
        }
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> doctors() {
        return userRepository.findByRole(Role.DOCTOR).stream()
                .map(this::doctorListDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> connectedPatients(Long doctorId) {
        return userRepository.findByDoctor_Id(doctorId).stream()
                .map(UserProfileDto::from)
                .toList();
    }

    private UserProfileDto doctorListDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUid(String.valueOf(user.getId()));
        dto.setName(user.getName());
        dto.setRole(user.getRole().name().toLowerCase());
        dto.setEmail(user.getEmail());
        dto.setSpecialization(user.getSpecialization());
        dto.setClinicName(user.getClinicName());
        dto.setProfileCompleted(user.isProfileCompleted());
        return dto;
    }

    private void applyEmergencyContact(User user, ProfileUpdateRequest request) {
        if (request.getEmergencyContact() == null) {
            return;
        }
        EmergencyContact contact = user.getEmergencyContact() != null ? user.getEmergencyContact() : new EmergencyContact();
        contact.setName(request.getEmergencyContact().name());
        contact.setPhone(request.getEmergencyContact().phone());
        user.setEmergencyContact(contact);
    }

    private void applyMedicalCondition(User user, ProfileUpdateRequest request) {
        if (request.getMedicalConditions() == null) {
            return;
        }
        MedicalCondition condition = user.getMedicalCondition() != null ? user.getMedicalCondition() : new MedicalCondition();
        condition.setDiabetes(request.getMedicalConditions().diabetes());
        condition.setBp(request.getMedicalConditions().bp());
        condition.setThyroid(request.getMedicalConditions().thyroid());
        condition.setAnemia(request.getMedicalConditions().anemia());
        condition.setAsthma(request.getMedicalConditions().asthma());
        condition.setOtherCondition(request.getMedicalConditions().other());
        user.setMedicalCondition(condition);
    }

    private void applyPregnancyProfile(User user, ProfileUpdateRequest request) {
        boolean hasPregnancyData = request.getPregnancyStartDate() != null
                || request.getTrimester() != null
                || request.getPreviousComplications() != null
                || request.getHighRisk() != null;
        if (!hasPregnancyData) {
            return;
        }
        PregnancyProfile pregnancy = user.getPregnancyProfile() != null ? user.getPregnancyProfile() : new PregnancyProfile();
        setIfNotNull(request.getPregnancyStartDate(), pregnancy::setPregnancyStartDate);
        setIfNotNull(request.getTrimester(), pregnancy::setTrimester);
        setIfNotNull(request.getPreviousComplications(), pregnancy::setPreviousComplications);
        if (request.getHighRisk() != null) {
            pregnancy.setHighRisk(request.getHighRisk());
        }
        user.setPregnancyProfile(pregnancy);
    }

    private void applyBaby(User user, ProfileUpdateRequest request) {
        boolean hasBabyData = request.getBabyDob() != null
                || request.getBabyName() != null
                || request.getBabyGender() != null
                || request.getFeedingPreference() != null;
        if (!hasBabyData) {
            return;
        }
        Baby baby = user.getBaby() != null ? user.getBaby() : new Baby();
        setIfNotNull(request.getBabyDob(), baby::setBabyDob);
        setIfNotNull(request.getBabyName(), baby::setBabyName);
        setIfNotNull(request.getBabyGender(), baby::setBabyGender);
        setIfNotNull(request.getBabyBloodGroup(), baby::setBabyBloodGroup);
        setIfNotNull(request.getDeliveryType(), baby::setDeliveryType);
        setIfNotNull(request.getBirthWeight(), baby::setBirthWeight);
        if (request.getPremature() != null) {
            baby.setPremature(request.getPremature());
        }
        setIfNotNull(request.getFeedingPreference(), baby::setFeedingPreference);
        setIfNotNull(request.getBabyAllergies(), baby::setBabyAllergies);
        setIfNotNull(request.getBabyHealthConditions(), baby::setBabyHealthConditions);
        setIfNotNull(request.getPediatricianName(), baby::setPediatricianName);
        setIfNotNull(request.getPediatricianContact(), baby::setPediatricianContact);
        user.setBaby(baby);
    }

    private void applyLifestyle(User user, ProfileUpdateRequest request) {
        if (request.getLifestyle() == null) {
            return;
        }
        Lifestyle lifestyle = user.getLifestyle() != null ? user.getLifestyle() : new Lifestyle();
        lifestyle.setSleep(request.getLifestyle().sleep());
        lifestyle.setActivity(request.getLifestyle().activity());
        lifestyle.setDiet(request.getLifestyle().diet());
        lifestyle.setAllergies(request.getLifestyle().allergies());
        user.setLifestyle(lifestyle);
    }

    private void applyDietPreferences(User user, ProfileUpdateRequest request) {
        if (request.getDietPreferences() == null) {
            return;
        }
        DietPreferences preferences = user.getDietPreferences() != null ? user.getDietPreferences() : new DietPreferences();
        ProfileUpdateRequest.MotherDietRequest mother = request.getDietPreferences().getMother();
        if (mother != null) {
            preferences.setMotherDietType(mother.getDietType());
            preferences.setMotherMealPattern(mother.getMealPattern());
            preferences.setMotherWaterIntake(mother.getWaterIntake());
            preferences.setMotherRestrictions(copyList(mother.getRestrictions()));
            preferences.setMotherAllergies(copyList(mother.getAllergies()));
        }
        ProfileUpdateRequest.BabyDietRequest baby = request.getDietPreferences().getBaby();
        if (baby != null) {
            preferences.setBabyFeedingType(baby.getFeedingType());
            preferences.setBabySolidFoodStarted(baby.getSolidFoodStarted());
            preferences.setBabyWeaningStyle(baby.getWeaningStyle());
            preferences.setBabyAllergies(copyList(baby.getAllergies()));
        }
        user.setDietPreferences(preferences);
    }

    private List<String> copyList(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }

    private void setIfNotNull(String value, java.util.function.Consumer<String> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
