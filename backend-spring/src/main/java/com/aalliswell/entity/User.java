package com.aalliswell.entity;

import com.aalliswell.enums.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email", unique = true),
                @Index(name = "idx_users_role", columnList = "role")
        }
)
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.PREGNANT;

    @Column(nullable = false)
    private String language = "English";

    private String age;
    private String height;
    private String weight;
    private String bloodGroup;
    private String specialization;
    private String clinicName;
    private String joinCode;
    private String doctorRoomId;
    private String fcmToken;
    private String timezone = "UTC";

    @Column(nullable = false)
    private boolean profileCompleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private EmergencyContact emergencyContact;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private MedicalCondition medicalCondition;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PregnancyProfile pregnancyProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Baby baby;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Lifestyle lifestyle;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private DietPreferences dietPreferences;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reminder> reminders = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    public void setEmergencyContact(EmergencyContact emergencyContact) {
        if (emergencyContact != null) {
            emergencyContact.setUser(this);
        }
        this.emergencyContact = emergencyContact;
    }

    public void setMedicalCondition(MedicalCondition medicalCondition) {
        if (medicalCondition != null) {
            medicalCondition.setUser(this);
        }
        this.medicalCondition = medicalCondition;
    }

    public void setPregnancyProfile(PregnancyProfile pregnancyProfile) {
        if (pregnancyProfile != null) {
            pregnancyProfile.setUser(this);
        }
        this.pregnancyProfile = pregnancyProfile;
    }

    public void setBaby(Baby baby) {
        if (baby != null) {
            baby.setUser(this);
        }
        this.baby = baby;
    }

    public void setLifestyle(Lifestyle lifestyle) {
        if (lifestyle != null) {
            lifestyle.setUser(this);
        }
        this.lifestyle = lifestyle;
    }

    public void setDietPreferences(DietPreferences dietPreferences) {
        if (dietPreferences != null) {
            dietPreferences.setUser(this);
        }
        this.dietPreferences = dietPreferences;
    }
}
