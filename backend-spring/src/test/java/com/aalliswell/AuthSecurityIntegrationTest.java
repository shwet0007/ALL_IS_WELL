package com.aalliswell;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aalliswell.entity.User;
import com.aalliswell.enums.Role;
import com.aalliswell.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerAndLoginReturnJwtAndUser() throws Exception {
        register("first@example.com", "MOTHER")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.user.email").value("first@example.com"))
                .andExpect(jsonPath("$.user.role").value("mother"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "email", "first@example.com",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString());
    }

    @Test
    void publicDoctorRegistrationReturns403() throws Exception {
        register("public-doctor@example.com", "DOCTOR")
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Doctor accounts require verification or administrator approval."));
    }

    @Test
    void protectedApiWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedApiWithValidPatientTokenReturnsProfile() throws Exception {
        String token = tokenFrom(register("patient@example.com", "PREGNANT")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());

        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.email").value("patient@example.com"))
                .andExpect(jsonPath("$.profile.role").value("pregnant"));
    }

    @Test
    void protectedApiWithInvalidJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedApiWithExpiredJwtReturns401() throws Exception {
        register("expired-token@example.com", "MOTHER").andExpect(status().isOk());

        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + expiredToken("expired-token@example.com")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void motherCannotAccessDoctorOnlyEndpoint() throws Exception {
        String token = tokenFrom(register("mother@example.com", "MOTHER")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());

        mockMvc.perform(post("/api/users/checkups")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "patientId", "1",
                                "date", "2026-09-01",
                                "type", "pregnancy"
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void doctorCanAccessDoctorRequests() throws Exception {
        createVerifiedDoctor("doctor@example.com");
        String token = loginToken("doctor@example.com");

        mockMvc.perform(get("/api/users/doctor-requests")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requests").isArray());
    }

    @Test
    void invalidLoginReturns401() throws Exception {
        register("wrong-password@example.com", "PREGNANT").andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "email", "wrong-password@example.com",
                                "password", "bad-password"
                        ))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patientCannotEscalateProfileToDoctor() throws Exception {
        String token = tokenFrom(register("profile-escalation@example.com", "MOTHER")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());

        mockMvc.perform(put("/api/users/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("role", "DOCTOR"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Doctor accounts require verification or administrator approval."));
    }

    @Test
    void patientCannotAccessConnectedPatientsEndpoint() throws Exception {
        String token = tokenFrom(register("connected-patients-patient@example.com", "PREGNANT")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());

        mockMvc.perform(get("/api/users/connected-patients")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void doctorCanScheduleOnlyConnectedPatients() throws Exception {
        User doctor = createVerifiedDoctor("scheduler-doctor@example.com");
        String doctorToken = loginToken("scheduler-doctor@example.com");
        register("connected-schedule-patient@example.com", "MOTHER").andExpect(status().isOk());
        register("unconnected-schedule-patient@example.com", "MOTHER").andExpect(status().isOk());

        User connectedPatient = userRepository.findByEmail("connected-schedule-patient@example.com").orElseThrow();
        connectedPatient.setDoctor(doctor);
        userRepository.save(connectedPatient);
        User unconnectedPatient = userRepository.findByEmail("unconnected-schedule-patient@example.com").orElseThrow();

        mockMvc.perform(post("/api/users/checkups")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "patientId", String.valueOf(unconnectedPatient.getId()),
                                "date", "2026-09-01",
                                "type", "pregnancy"
                        ))))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/users/checkups")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "patientId", String.valueOf(connectedPatient.getId()),
                                "date", "2026-09-02",
                                "type", "pregnancy"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checkup.patientId").value(String.valueOf(connectedPatient.getId())));
    }

    @Test
    void userCannotDeleteAnotherUsersReport() throws Exception {
        String ownerToken = tokenFrom(register("report-owner@example.com", "MOTHER")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
        String intruderToken = tokenFrom(register("report-intruder@example.com", "MOTHER")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());

        String responseBody = mockMvc.perform(post("/api/users/reports")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "date", "2026-09-01",
                                "fileName", "Blood Test",
                                "fileUrl", "https://example.com/report.pdf",
                                "doctorName", "Dr. Care"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String reportId = objectMapper.readTree(responseBody).at("/report/id").asText();

        mockMvc.perform(delete("/api/users/reports/" + reportId)
                        .header("Authorization", "Bearer " + intruderToken))
                .andExpect(status().isNotFound());
    }

    private org.springframework.test.web.servlet.ResultActions register(String email, String role) throws Exception {
        return mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "name", "Test User",
                        "email", email,
                        "password", "password123",
                        "role", role
                ))));
    }

    private User createVerifiedDoctor(String email) {
        User doctor = new User();
        doctor.setName("Doctor User");
        doctor.setEmail(email);
        doctor.setRole(Role.DOCTOR);
        doctor.setPasswordHash(passwordEncoder.encode("password123"));
        doctor.setSpecialization("Pediatrics");
        doctor.setClinicName("Care Clinic");
        doctor.setProfileCompleted(true);
        return userRepository.save(doctor);
    }

    private String loginToken(String email) throws Exception {
        return tokenFrom(mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "email", email,
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
    }

    private String tokenFrom(String body) throws Exception {
        JsonNode json = objectMapper.readTree(body);
        return json.get("accessToken").asText();
    }

    private String expiredToken(String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .claim("email", email)
                .claim("role", "MOTHER")
                .issuedAt(Date.from(now.minusSeconds(120)))
                .expiration(Date.from(now.minusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor("12345678901234567890123456789012".getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
