package com.se411.fleet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.se411.fleet.dto.VehicleRequest;
import com.se411.fleet.exception.InvalidVehicleException;
import com.se411.fleet.exception.VehicleNotFoundException;
import com.se411.fleet.model.Vehicle;
import com.se411.fleet.repository.VehicleRepository;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    VehicleRepository repository;

    @InjectMocks
    VehicleService service;

    private static VehicleRequest request(String plate, int year, String driver) {
        return new VehicleRequest(plate, "Toyota", "Hilux", year, 1000L, driver,
                LocalDate.of(2026, 1, 1), LocalDate.of(2027, 1, 1), "Active");
    }

    @Test
    void createNormalizesFieldsAndSaves() {
        when(repository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));

        Vehicle saved = service.create(new VehicleRequest("  abc-1  ", " Toyota ", " Hilux ", 2022, 5L,
                "  Khalid  ", null, null, "Active"));

        assertThat(saved.getPlate()).isEqualTo("ABC-1");
        assertThat(saved.getMake()).isEqualTo("Toyota");
        assertThat(saved.getModel()).isEqualTo("Hilux");
        assertThat(saved.getDriver()).isEqualTo("Khalid");
        assertThat(saved.getYear()).isEqualTo(2022);
        assertThat(saved.getMileage()).isEqualTo(5L);
        assertThat(saved.getStatus()).isEqualTo("Active");
        assertThat(saved.getLastService()).isNull();
    }

    @Test
    void createTurnsNullDriverIntoEmptyString() {
        when(repository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.create(request("A-1", 2022, null)).getDriver()).isEmpty();
    }

    @Test
    void createAcceptsNextYearButRejectsLater() {
        when(repository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));
        int nextYear = Year.now().getValue() + 1;

        assertThat(service.create(request("A-1", nextYear, "")).getYear()).isEqualTo(nextYear);

        assertThatThrownBy(() -> service.create(request("A-2", nextYear + 1, "")))
                .isInstanceOf(InvalidVehicleException.class)
                .satisfies(ex -> assertThat(((InvalidVehicleException) ex).getFieldErrors())
                        .containsEntry("year", "Enter a valid year"));
    }

    @Test
    void getByIdReturnsVehicle() {
        Vehicle v = new Vehicle();
        v.setId(7L);
        when(repository.findById(7L)).thenReturn(Optional.of(v));

        assertThat(service.getById(7L)).isSameAs(v);
    }

    @Test
    void getByIdThrowsWhenMissing() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(VehicleNotFoundException.class)
                .hasMessage("Vehicle 99 not found");
    }

    @Test
    void listLowercasesQueryAndTreatsAllAsNoStatusFilter() {
        Page<Vehicle> page = new PageImpl<>(List.of(new Vehicle()));
        when(repository.search(eq("toy"), eq(""), any(Pageable.class))).thenReturn(page);

        assertThat(service.list(0, 10, "  ToY ", "All")).isSameAs(page);
    }

    @Test
    void listPassesStatusAndHandlesNulls() {
        Page<Vehicle> page = new PageImpl<>(List.of());
        when(repository.search(eq(""), eq("Retired"), any(Pageable.class))).thenReturn(page);
        when(repository.search(eq(""), eq(""), any(Pageable.class))).thenReturn(page);

        assertThat(service.list(0, 10, null, "Retired")).isSameAs(page);
        assertThat(service.list(0, 10, null, null)).isSameAs(page);
    }

    @Test
    void listClampsPageAndSize() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        when(repository.search(eq(""), eq(""), captor.capture())).thenReturn(Page.empty());

        service.list(-5, 0, "", "All");
        assertThat(captor.getValue().getPageNumber()).isZero();
        assertThat(captor.getValue().getPageSize()).isEqualTo(1);

        service.list(2, 5000, "", "All");
        assertThat(captor.getValue().getPageNumber()).isEqualTo(2);
        assertThat(captor.getValue().getPageSize()).isEqualTo(VehicleService.MAX_PAGE_SIZE);
    }

    @Test
    void updateChangesExistingVehicle() {
        Vehicle existing = new Vehicle();
        existing.setId(3L);
        existing.setPlate("OLD-1");
        when(repository.findById(3L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        Vehicle updated = service.update(3L, request("new-2", 2023, "Sara"));

        assertThat(updated.getId()).isEqualTo(3L);
        assertThat(updated.getPlate()).isEqualTo("NEW-2");
        assertThat(updated.getDriver()).isEqualTo("Sara");
        verify(repository).save(existing);
    }

    @Test
    void updateThrowsWhenMissing() {
        when(repository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(5L, request("A-1", 2022, "")))
                .isInstanceOf(VehicleNotFoundException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void deleteRemovesExistingVehicle() {
        when(repository.existsById(4L)).thenReturn(true);

        service.delete(4L);

        verify(repository).deleteById(4L);
    }

    @Test
    void deleteThrowsWhenMissing() {
        when(repository.existsById(anyLong())).thenReturn(false);

        assertThatThrownBy(() -> service.delete(8L)).isInstanceOf(VehicleNotFoundException.class);
        verify(repository, never()).deleteById(anyLong());
    }
}
