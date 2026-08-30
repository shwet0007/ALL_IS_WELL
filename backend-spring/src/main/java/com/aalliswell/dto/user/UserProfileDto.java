package com.aalliswell.dto.user;

import com.aalliswell.entity.Baby;
import com.aalliswell.entity.DietPreferences;
import com.aalliswell.entity.EmergencyContact;
import com.aalliswell.entity.Lifestyle;
import com.aalliswell.entity.MedicalCondition;
import com.aalliswell.entity.PregnancyProfile;
import com.aalliswell.entity.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserProfileDto {
    private Long id;
    private String uid;

    private String name;
    private String email;
    private String role;
    private String language;
    private String age;
    private String height;
    private String weight;
    private String bloodGroup;
    private EmergencyContactDto emergencyContact;
    private MedicalConditionsDto medicalConditions;
    private String joinCode;
    private String assignedDoctorId;
    private String doctorRoomId;
    private String doctorId;
    private String doctorName;
    private String pregnancyStartDate;
    private String trimester;
    private String previousComplications;
    private Boolean highRisk;
    private String babyDob;
    private String babyName;
    private String babyGender;
    private String babyBloodGroup;
    private String deliveryType;
    private String birthWeight;
    private Boolean premature;
    private String feedingPreference;
    private String babyAllergies;
    private String babyHealthConditions;
    private String pediatricianName;
    private String pediatricianContact;
    private String specialization;
    private String clinicName;
    private LifestyleDto lifestyle;
    private DietPreferencesDto dietPreferences;
    private boolean profileCompleted;
    private Instant createdAt;
    private Instant updatedAt;

    public static UserProfileDto from(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.id = user.getId();
        dto.uid = String.valueOf(user.getId());
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.role = user.getRole().name().toLowerCase();
        dto.language = user.getLanguage();
        dto.age = user.getAge();
        dto.height = user.getHeight();
        dto.weight = user.getWeight();
        dto.bloodGroup = user.getBloodGroup();
        dto.joinCode = user.getJoinCode();
        dto.doctorRoomId = user.getDoctorRoomId();
        dto.profileCompleted = user.isProfileCompleted();
        dto.createdAt = user.getCreatedAt();
        dto.updatedAt = user.getUpdatedAt();

        if (user.getDoctor() != null) {
            dto.assignedDoctorId = String.valueOf(user.getDoctor().getId());
            dto.doctorId = String.valueOf(user.getDoctor().getId());
            dto.doctorName = user.getDoctor().getName();
        }
        EmergencyContact contact = user.getEmergencyContact();
        if (contact != null) {
            dto.emergencyContact = new EmergencyContactDto(contact.getName(), contact.getPhone());
        }
        MedicalCondition condition = user.getMedicalCondition();
        if (condition != null) {
            dto.medicalConditions = new MedicalConditionsDto(
                    condition.isDiabetes(),
                    condition.isBp(),
                    condition.isThyroid(),
                    condition.isAnemia(),
                    condition.isAsthma(),
                    condition.getOtherCondition()
            );
        }
        PregnancyProfile pregnancy = user.getPregnancyProfile();
        if (pregnancy != null) {
            dto.pregnancyStartDate = pregnancy.getPregnancyStartDate();
            dto.trimester = pregnancy.getTrimester();
            dto.previousComplications = pregnancy.getPreviousComplications();
            dto.highRisk = pregnancy.getHighRisk();
        }
        Baby baby = user.getBaby();
        if (baby != null) {
            dto.babyDob = baby.getBabyDob();
            dto.babyName = baby.getBabyName();
            dto.babyGender = baby.getBabyGender();
            dto.babyBloodGroup = baby.getBabyBloodGroup();
            dto.deliveryType = baby.getDeliveryType();
            dto.birthWeight = baby.getBirthWeight();
            dto.premature = baby.getPremature();
            dto.feedingPreference = baby.getFeedingPreference();
            dto.babyAllergies = baby.getBabyAllergies();
            dto.babyHealthConditions = baby.getBabyHealthConditions();
            dto.pediatricianName = baby.getPediatricianName();
            dto.pediatricianContact = baby.getPediatricianContact();
        }
        dto.specialization = user.getSpecialization();
        dto.clinicName = user.getClinicName();

        Lifestyle lifestyle = user.getLifestyle();
        if (lifestyle != null) {
            dto.lifestyle = new LifestyleDto(
                    lifestyle.getSleep(),
                    lifestyle.getActivity(),
                    lifestyle.getDiet(),
                    lifestyle.getAllergies()
            );
        }
        DietPreferences preferences = user.getDietPreferences();
        if (preferences != null) {
            MotherDietDto mother = new MotherDietDto(
                    preferences.getMotherDietType(),
                    new ArrayList<>(preferences.getMotherRestrictions()),
                    new ArrayList<>(preferences.getMotherAllergies()),
                    preferences.getMotherMealPattern(),
                    preferences.getMotherWaterIntake()
            );
            BabyDietDto babyDiet = new BabyDietDto(
                    preferences.getBabyFeedingType(),
                    new ArrayList<>(preferences.getBabyAllergies()),
                    preferences.getBabySolidFoodStarted(),
                    preferences.getBabyWeaningStyle()
            );
            dto.dietPreferences = new DietPreferencesDto(mother, babyDiet);
        }
        return dto;
    }

    public record EmergencyContactDto(String name, String phone) {
    }

    public record MedicalConditionsDto(
            boolean diabetes,
            boolean bp,
            boolean thyroid,
            boolean anemia,
            boolean asthma,
            String other
    ) {
    }

    public record LifestyleDto(String sleep, String activity, String diet, String allergies) {
    }

    public record DietPreferencesDto(MotherDietDto mother, BabyDietDto baby) {
    }

    public record MotherDietDto(
            String dietType,
            List<String> restrictions,
            List<String> allergies,
            String mealPattern,
            String waterIntake
    ) {
    }

    public record BabyDietDto(
            String feedingType,
            List<String> allergies,
            Boolean solidFoodStarted,
            String weaningStyle
    ) {
    }
}
