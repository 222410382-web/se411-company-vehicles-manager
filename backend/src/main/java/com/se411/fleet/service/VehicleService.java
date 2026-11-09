package com.se411.fleet.service;

import com.se411.fleet.dto.VehicleRequest;
import com.se411.fleet.exception.InvalidVehicleException;
import com.se411.fleet.exception.VehicleNotFoundException;
import com.se411.fleet.model.Vehicle;
import com.se411.fleet.repository.VehicleRepository;
import java.time.Year;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class VehicleService {

    static final int MAX_PAGE_SIZE = 1000;

    private final VehicleRepository repository;

    public VehicleService(VehicleRepository repository) {
        this.repository = repository;
    }

    public Vehicle create(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        apply(vehicle, request);
        return repository.save(vehicle);
    }

    public Vehicle getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new VehicleNotFoundException(id));
    }

    public Page<Vehicle> list(int page, int size, String query, String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String s = status == null || status.equalsIgnoreCase("All") ? "" : status.trim();
        return repository.search(q, s, PageRequest.of(safePage, safeSize, Sort.by("id")));
    }

    public Vehicle update(Long id, VehicleRequest request) {
        Vehicle vehicle = getById(id);
        apply(vehicle, request);
        return repository.save(vehicle);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new VehicleNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private void apply(Vehicle vehicle, VehicleRequest r) {
        if (r.year() > Year.now().getValue() + 1) {
            throw new InvalidVehicleException(Map.of("year", "Enter a valid year"));
        }
        vehicle.setPlate(r.plate().trim().toUpperCase(Locale.ROOT));
        vehicle.setMake(r.make().trim());
        vehicle.setModel(r.model().trim());
        vehicle.setYear(r.year());
        vehicle.setMileage(r.mileage());
        vehicle.setDriver(r.driver() == null ? "" : r.driver().trim());
        vehicle.setLastService(r.lastService());
        vehicle.setInsuranceExpiry(r.insuranceExpiry());
        vehicle.setStatus(r.status());
    }
}
