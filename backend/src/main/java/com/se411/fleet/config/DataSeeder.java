package com.se411.fleet.config;

import com.se411.fleet.model.Vehicle;
import com.se411.fleet.repository.VehicleRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Loads the same five demo vehicles as the frontend's seedVehicles.js into an empty H2 database. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final VehicleRepository repository;

    public DataSeeder(VehicleRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        repository.saveAll(List.of(
                vehicle("ABC-1234", "Toyota", "Hilux", 2022, 41200, "Khalid Alharbi", "2026-08-14", "2027-03-01", "Active"),
                vehicle("DKR-5521", "Ford", "Transit", 2020, 98750, "Sara Alotaibi", "2026-06-02", "2026-12-20", "Active"),
                vehicle("HJL-7788", "Nissan", "Patrol", 2019, 132400, "Omar Alqahtani", "2026-09-25", "2027-01-15", "In Maintenance"),
                vehicle("RYD-3090", "Hyundai", "Accent", 2023, 18300, "Noura Alsaleh", "2026-07-18", "2027-05-30", "Active"),
                vehicle("QSM-4412", "Mercedes-Benz", "Sprinter", 2017, 245000, "", "2025-11-09", "2026-02-10", "Retired")));
    }

    private static Vehicle vehicle(String plate, String make, String model, int year, long mileage,
                                   String driver, String lastService, String insuranceExpiry, String status) {
        Vehicle v = new Vehicle();
        v.setPlate(plate);
        v.setMake(make);
        v.setModel(model);
        v.setYear(year);
        v.setMileage(mileage);
        v.setDriver(driver);
        v.setLastService(LocalDate.parse(lastService));
        v.setInsuranceExpiry(LocalDate.parse(insuranceExpiry));
        v.setStatus(status);
        return v;
    }
}
