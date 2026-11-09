package com.se411.fleet.exception;

import java.util.Map;

/** Business-rule violation, carrying per-field messages like bean validation does. */
public class InvalidVehicleException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public InvalidVehicleException(Map<String, String> fieldErrors) {
        super("Invalid vehicle: " + fieldErrors);
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
