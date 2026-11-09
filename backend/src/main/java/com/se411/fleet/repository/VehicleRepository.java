package com.se411.fleet.repository;

import com.se411.fleet.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Paginated search. {@code q} must be lower-case ("" = no text filter) and
     * matches plate, make, model or driver; {@code status} "" = any status.
     */
    @Query("""
            select v from Vehicle v
            where (:status = '' or v.status = :status)
              and (:q = ''
                   or lower(v.plate) like concat('%', :q, '%')
                   or lower(v.make) like concat('%', :q, '%')
                   or lower(v.model) like concat('%', :q, '%')
                   or lower(v.driver) like concat('%', :q, '%'))
            """)
    Page<Vehicle> search(@Param("q") String q, @Param("status") String status, Pageable pageable);
}
