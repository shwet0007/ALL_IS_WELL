package com.aalliswell.repository;

import com.aalliswell.entity.DoctorNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorNoteRepository extends JpaRepository<DoctorNote, Long> {

    List<DoctorNote> findByPatient_IdOrderByDateDesc(Long patientId);
}
