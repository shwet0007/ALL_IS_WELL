package com.aalliswell.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "diet_preferences")
public class DietPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String motherDietType;
    private String motherMealPattern;
    private String motherWaterIntake;

    @ElementCollection
    @CollectionTable(name = "diet_mother_restrictions", joinColumns = @JoinColumn(name = "diet_preferences_id"))
    @Column(name = "restriction")
    private List<String> motherRestrictions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "diet_mother_allergies", joinColumns = @JoinColumn(name = "diet_preferences_id"))
    @Column(name = "allergy")
    private List<String> motherAllergies = new ArrayList<>();

    private String babyFeedingType;
    private Boolean babySolidFoodStarted;
    private String babyWeaningStyle;

    @ElementCollection
    @CollectionTable(name = "diet_baby_allergies", joinColumns = @JoinColumn(name = "diet_preferences_id"))
    @Column(name = "allergy")
    private List<String> babyAllergies = new ArrayList<>();
}
