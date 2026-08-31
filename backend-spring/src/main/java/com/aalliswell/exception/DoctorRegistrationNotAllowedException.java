package com.aalliswell.exception;

public class DoctorRegistrationNotAllowedException extends RuntimeException {

    public DoctorRegistrationNotAllowedException(String message) {
        super(message);
    }
}
