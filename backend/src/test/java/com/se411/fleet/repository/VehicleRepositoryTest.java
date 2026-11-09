package com.se411.fleet.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.se411.fleet.model.Vehicle;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@DataJpaTest
class VehicleRepositoryTest {

    @Autowired
    VehicleRepository repository;

    @BeforeEach
    void seed() {
        repository.save(vehicle("ABC-1", "Toyota", "Hilux", "Khalid", "Active"));
        repository.save(vehicle("DKR-2", "Ford", "Transit", "Sara", "Active"));
        repository.save(vehicle("HJL-3", "Nissan", "Patrol", "Omar", "In Maintenance"));
    }

    private static Vehicle vehicle(String plate, String make, String model, String driver, String status) {
        Vehicle v = new Vehicle();
        v.setPlate(plate);
        v.setMake(make);
        v.setModel(model);
        v.setYear(2022);
        v.setMileage(1000);
        v.setDriver(driver);
        v.setLastService(LocalDate.of(2026, 1, 1));
        v.setInsuranceExpiry(LocalDate.of(2027, 1, 1));
        v.setStatus(status);
        return v;
    }

    private static PageRequest firstPage() {
        return PageRequest.of(0, 10, Sort.by("id"));
    }

    @Test
    void emptyFiltersReturnEverything() {
        assertThat(repository.search("", "", firstPage()).getTotalElements()).isEqualTo(3);
    }

    @Test
    void textSearchMatchesPlateMakeModelAndDriver() {
        assertThat(repository.search("abc", "", firstPage()).getContent()).extracting(Vehicle::getMake).containsExactly("Toyota");
        assertThat(repository.search("ford", "", firstPage()).getContent()).extracting(Vehicle::getPlate).containsExactly("DKR-2");
        assertThat(repository.search("patrol", "", firstPage()).getContent()).extracting(Vehicle::getPlate).containsExactly("HJL-3");
        assertThat(repository.search("omar", "", firstPage()).getContent()).extracting(Vehicle::getPlate).containsExactly("HJL-3");
        assertThat(repository.search("nothing", "", firstPage()).getContent()).isEmpty();
    }

    @Test
    void statusFilterIsExact() {
        assertThat(repository.search("", "Active", firstPage()).getTotalElements()).isEqualTo(2);
        assertThat(repository.search("", "In Maintenance", firstPage()).getContent()).hasSize(1);
        assertThat(repository.search("", "Retired", firstPage()).getContent()).isEmpty();
    }

    @Test
    void textAndStatusCombine() {
        assertThat(repository.search("sara", "In Maintenance", firstPage()).getContent()).isEmpty();
        assertThat(repository.search("sara", "Active", firstPage()).getContent()).hasSize(1);
    }

    @Test
    void paginationSplitsResults() {
        Page<Vehicle> second = repository.search("", "", PageRequest.of(1, 2, Sort.by("id")));

        assertThat(second.getTotalElements()).isEqualTo(3);
        assertThat(second.getTotalPages()).isEqualTo(2);
        assertThat(second.getContent()).extracting(Vehicle::getPlate).containsExactly("HJL-3");
    }
}
