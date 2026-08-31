package com.aalliswell.service;

import com.aalliswell.dto.auth.AuthResponse;
import com.aalliswell.dto.auth.LoginRequest;
import com.aalliswell.dto.auth.RegisterRequest;
import com.aalliswell.dto.user.UserProfileDto;
import com.aalliswell.entity.User;
import com.aalliswell.enums.Role;
import com.aalliswell.exception.DoctorRegistrationNotAllowedException;
import com.aalliswell.exception.EmailAlreadyExistsException;
import com.aalliswell.exception.InvalidCredentialsException;
import com.aalliswell.repository.UserRepository;
import com.aalliswell.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        Role requestedRole = EnumParser.parse(Role.class, request.role(), Role.PREGNANT);
        if (requestedRole == Role.DOCTOR) {
            throw new DoctorRegistrationNotAllowedException("Doctor accounts require verification or administrator approval.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(resolveName(request.name(), email));
        user.setRole(requestedRole);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(saved), UserProfileDto.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        return new AuthResponse(jwtService.generateToken(user), UserProfileDto.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String resolveName(String name, String email) {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        return email.substring(0, email.indexOf('@'));
    }
}
