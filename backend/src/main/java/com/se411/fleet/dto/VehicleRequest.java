package com.se411.fleet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

/**
 * Body for creating or updating a vehicle. Mirrors the rules in the frontend's
 * {@code validate()} (VehicleForm.jsx); the upper bound on {@code year} depends
 * on the current year, so it is checked in the service.
 */
public record VehicleRequest(
        @NotBlank(message = "Plate number is required") String plate,
        @NotBlank(message = "Make is required") String make,
        @NotBlank(message = "Model is required") String model,
        @NotNull(message = "Enter a valid year") @Min(value = 1980, message = "Enter a valid year") Integer year,
        @NotNull(message = "Mileage must be 0 or more") @Min(value = 0, message = "Mileage must be 0 or more") Long mileage,
        String driver,
        LocalDate lastService,
        LocalDate insuranceExpiry,
        @NotNull(message = "Status is required")
        @Pattern(regexp = "Active|In Maintenance|Retired", message = "Status must be Active, In Maintenance or Retired")
        String status) {
}
