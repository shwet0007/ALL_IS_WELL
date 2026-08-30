package com.aalliswell.service;

public final class EnumParser {

    private EnumParser() {
    }

    public static <T extends Enum<T>> T parse(Class<T> enumType, String value, T fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String normalized = value.trim().replace('-', '_').toUpperCase();
        try {
            return Enum.valueOf(enumType, normalized);
        } catch (IllegalArgumentException ex) {
            return fallback;
        }
    }

    public static Long parseId(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(fieldName + " must be a numeric id");
        }
    }
}
