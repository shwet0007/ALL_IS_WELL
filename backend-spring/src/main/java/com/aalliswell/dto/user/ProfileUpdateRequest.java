package com.aalliswell.dto.user;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String role;
    private String language;
    private String age;
    private String height;
    private String weight;
    private String bloodGroup;
    private UserProfileDto.EmergencyContactDto emergencyContact;
    private UserProfileDto.MedicalConditionsDto medicalConditions;
    private String joinCode;
    private String assignedDoctorId;
    private String doctorRoomId;
    private String doctorId;
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
    private UserProfileDto.LifestyleDto lifestyle;
    private DietPreferencesRequest dietPreferences;

    @Getter
    @Setter
    public static class DietPreferencesRequest {
        private MotherDietRequest mother;
        private BabyDietRequest baby;
    }

    @Getter
    @Setter
    public static class MotherDietRequest {
        private String dietType;
        private List<String> restrictions;
        private List<String> allergies;
        private String mealPattern;
        private String waterIntake;
    }

    @Getter
    @Setter
    public static class BabyDietRequest {
        private String feedingType;
        private List<String> allergies;
        private Boolean solidFoodStarted;
        private String weaningStyle;
    }
}
