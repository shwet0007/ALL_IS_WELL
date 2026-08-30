package com.aalliswell.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
        name = "diary_entries",
        uniqueConstraints = @UniqueConstraint(name = "uk_diary_user_date", columnNames = {"user_id", "date"}),
        indexes = @Index(name = "idx_diary_user_date", columnList = "user_id,date")
)
public class DiaryEntry extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String mood;

    @Column(columnDefinition = "TEXT")
    private String text;

    @ElementCollection
    @CollectionTable(name = "diary_image_urls", joinColumns = @JoinColumn(name = "diary_entry_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "diary_medical_conditions", joinColumns = @JoinColumn(name = "diary_entry_id"))
    @Column(name = "condition_name")
    private List<String> medicalConditions = new ArrayList<>();

    private boolean milestone;
    private String milestoneTitle;
    private String milestoneCategory;

    @Column(columnDefinition = "TEXT")
    private String milestoneDescription;
}
