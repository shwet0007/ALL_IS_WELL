package com.aalliswell.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "babies")
public class Baby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

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

    @OneToMany(mappedBy = "baby", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vaccination> vaccinations = new ArrayList<>();
}
