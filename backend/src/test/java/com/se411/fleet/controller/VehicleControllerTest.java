package com.se411.fleet.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.se411.fleet.dto.VehicleRequest;
import com.se411.fleet.exception.InvalidVehicleException;
import com.se411.fleet.exception.VehicleNotFoundException;
import com.se411.fleet.model.Vehicle;
import com.se411.fleet.service.VehicleService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(VehicleController.class)
class VehicleControllerTest {

    private static final String VALID_BODY = """
            {"plate":"ABC-1","make":"Toyota","model":"Hilux","year":2022,"mileage":100,
             "driver":"Khalid","lastService":"2026-08-14","insuranceExpiry":"2027-03-01","status":"Active"}""";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    VehicleService service;

    private static Vehicle vehicle(long id) {
        Vehicle v = new Vehicle();
        v.setId(id);
        v.setPlate("ABC-1");
        v.setMake("Toyota");
        v.setModel("Hilux");
        v.setYear(2022);
        v.setMileage(100);
        v.setDriver("Khalid");
        v.setLastService(LocalDate.of(2026, 8, 14));
        v.setInsuranceExpiry(LocalDate.of(2027, 3, 1));
        v.setStatus("Active");
        return v;
    }

    @Test
    void postCreatesVehicleAndReturns201WithLocation() throws Exception {
        when(service.create(any(VehicleRequest.class))).thenReturn(vehicle(1));

        mvc.perform(post("/api/vehicles").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/vehicles/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.plate").value("ABC-1"))
                .andExpect(jsonPath("$.lastService").value("2026-08-14"));
    }

    @Test
    void postWithInvalidBodyReturns400WithFieldErrors() throws Exception {
        String body = """
                {"plate":" ","make":"","model":"Hilux","year":1900,"mileage":-1,"status":"Broken"}""";

        mvc.perform(post("/api/vehicles").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.plate").value("Plate number is required"))
                .andExpect(jsonPath("$.errors.make").value("Make is required"))
                .andExpect(jsonPath("$.errors.year").value("Enter a valid year"))
                .andExpect(jsonPath("$.errors.mileage").value("Mileage must be 0 or more"))
                .andExpect(jsonPath("$.errors.status").exists());
    }

    @Test
    void postWhenServiceRejectsReturns400() throws Exception {
        when(service.create(any(VehicleRequest.class)))
                .thenThrow(new InvalidVehicleException(Map.of("year", "Enter a valid year")));

        mvc.perform(post("/api/vehicles").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.year").value("Enter a valid year"));
    }

    @Test
    void getByIdReturnsVehicle() throws Exception {
        when(service.getById(1L)).thenReturn(vehicle(1));

        mvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.make").value("Toyota"));
    }

    @Test
    void getByIdReturns404WhenMissing() throws Exception {
        when(service.getById(9L)).thenThrow(new VehicleNotFoundException(9L));

        mvc.perform(get("/api/vehicles/9"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Vehicle 9 not found"));
    }

    @Test
    void listReturnsPaginatedResultsWithDefaults() throws Exception {
        PageImpl<Vehicle> page = new PageImpl<>(List.of(vehicle(1), vehicle(2)), PageRequest.of(0, 10), 2);
        when(service.list(0, 10, "", "All")).thenReturn(page);

        mvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void listPassesPagingAndFilters() throws Exception {
        PageImpl<Vehicle> page = new PageImpl<>(List.of(vehicle(3)), PageRequest.of(1, 2), 3);
        when(service.list(1, 2, "toy", "Active")).thenReturn(page);

        mvc.perform(get("/api/vehicles").param("page", "1").param("size", "2")
                        .param("q", "toy").param("status", "Active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalPages").value(2));
        verify(service).list(eq(1), eq(2), eq("toy"), eq("Active"));
    }

    @Test
    void putUpdatesVehicle() throws Exception {
        when(service.update(eq(1L), any(VehicleRequest.class))).thenReturn(vehicle(1));

        mvc.perform(put("/api/vehicles/1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void putReturns404WhenMissing() throws Exception {
        when(service.update(eq(5L), any(VehicleRequest.class))).thenThrow(new VehicleNotFoundException(5L));

        mvc.perform(put("/api/vehicles/5").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturns204() throws Exception {
        mvc.perform(delete("/api/vehicles/1")).andExpect(status().isNoContent());
        verify(service).delete(1L);
    }

    @Test
    void deleteReturns404WhenMissing() throws Exception {
        doThrow(new VehicleNotFoundException(2L)).when(service).delete(2L);

        mvc.perform(delete("/api/vehicles/2")).andExpect(status().isNotFound());
    }
}
