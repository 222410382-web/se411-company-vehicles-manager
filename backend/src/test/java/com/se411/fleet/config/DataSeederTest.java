package com.se411.fleet.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.se411.fleet.model.Vehicle;
import com.se411.fleet.repository.VehicleRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DataSeederTest {

    @Mock
    VehicleRepository repository;

    @InjectMocks
    DataSeeder seeder;

    @Test
    @SuppressWarnings("unchecked")
    void seedsFiveVehiclesIntoEmptyDatabase() {
        when(repository.count()).thenReturn(0L);

        seeder.run();

        ArgumentCaptor<List<Vehicle>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(5);
        assertThat(captor.getValue()).extracting(Vehicle::getPlate)
                .containsExactly("ABC-1234", "DKR-5521", "HJL-7788", "RYD-3090", "QSM-4412");
    }

    @Test
    void doesNothingWhenDataAlreadyExists() {
        when(repository.count()).thenReturn(3L);

        seeder.run();

        verify(repository, never()).saveAll(anyList());
    }
}
