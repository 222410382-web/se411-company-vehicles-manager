package com.se411.fleet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.se411.fleet.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/** Boots the whole application (H2 + seeder + web layer) as a smoke test. */
@SpringBootTest
@AutoConfigureMockMvc
class FleetApplicationTests {

    @Autowired
    VehicleRepository repository;

    @Autowired
    MockMvc mvc;

    @Test
    void contextLoadsAndSeedsDemoData() {
        assertThat(repository.count()).isEqualTo(5);
    }

    @Test
    void seededVehiclesAreServedOverHttp() throws Exception {
        mvc.perform(get("/api/vehicles").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(5))
                .andExpect(jsonPath("$.totalPages").value(3));
    }
}
