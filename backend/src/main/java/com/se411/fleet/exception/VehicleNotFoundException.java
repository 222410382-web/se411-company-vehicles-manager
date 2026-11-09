package com.se411.fleet.exception;

public class VehicleNotFoundException extends RuntimeException {

    public VehicleNotFoundException(Long id) {
        super("Vehicle " + id + " not found");
    }
}
