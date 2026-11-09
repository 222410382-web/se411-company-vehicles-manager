# Fleet Manager: Architecture, Stack and Features

SE411 (Fall 2026-27). A React frontend (Part 1) backed by a Spring Boot REST API with an H2 database (Part 2), for managing company vehicles.

## Technology stack

| Concern | Choice |
|---|---|
| UI library | React 19 |
| Build tool / dev server | Vite (dev server proxies `/api` to the backend) |
| Routing | React Router (`BrowserRouter`, nested routes with a shared layout) |
| Frontend state | React Context holding the fleet summary; the Vehicles page fetches its own page |
| Styling | Plain CSS with custom properties, light theme only |
| Frontend tests | Vitest, React Testing Library, jsdom |
| Frontend lint | oxlint |
| Backend | Java 21+, Spring Boot 3.5: Spring Web, Spring Data JPA, Bean Validation |
| Database | H2, in memory, seeded at startup |
| Backend tests | JUnit 5, Mockito, Spring Boot Test (MockMvc, `@DataJpaTest`) |
| Build | Maven |

## Features

1. **Home:** landing page with a project description, feature highlights and links into the app.
2. **Dashboard:** total vehicles, counts per status (Active, In Maintenance, Retired), and vehicles whose insurance has expired or expires within 30 days (retired vehicles excluded).
3. **List / display:** server-side paginated table (5 per page) with search (plate, make, model, driver) and a status filter.
4. **Add:** validated form (plate, make and model required; year 1980 to next year; mileage 0 or more). Plates are stored upper-case.
5. **Search by id / update:** the edit page loads the vehicle by id (`GET /api/vehicles/{id}`), then saves with `PUT`.
6. **Remove:** Delete button with a confirmation prompt.
7. **Menu and footer:** top navigation to Home, Dashboard, Vehicles, Add Vehicle and About, plus a copyright footer.
8. **About:** team members with names and student IDs.

## Vehicle record

`id`, `plate`, `make`, `model`, `year`, `mileage`, `driver`, `lastService`, `insuranceExpiry`, `status` (Active / In Maintenance / Retired). Dates are ISO strings (`2026-08-14`); a missing date is `null` in the API and `''` in the form.

## System architecture

```
Browser (React SPA)                          Spring Boot server                    H2 (in memory)
 pages ─ useVehicles() ─ vehiclesApi ──HTTP/JSON──> VehicleController ─ VehicleService ─ VehicleRepository ──> vehicles table
                          (fetch /api/...)           (routes, validation)   (business rules)   (Spring Data JPA)
                                                      GlobalExceptionHandler -> 400 / 404 JSON
```

### REST API

| Method | Route | Purpose | Success | Errors |
|---|---|---|---|---|
| POST | `/api/vehicles` | Add a vehicle | 201 + `Location` | 400 |
| GET | `/api/vehicles/{id}` | Search by id | 200 | 404 |
| GET | `/api/vehicles?page&size&q&status` | List, paginated (0-based `page`, `size` 1 to 1000), optional search and status filter | 200 | |
| PUT | `/api/vehicles/{id}` | Update a vehicle | 200 | 400, 404 |
| DELETE | `/api/vehicles/{id}` | Delete a vehicle | 204 | 404 |

### Backend layers

- **`VehicleController`:** maps routes, triggers bean validation (`@Valid`), builds the `PageResponse`.
- **`VehicleService`:** trims and normalizes input (plate upper-case, null driver becomes `""`), enforces the year upper bound (current year + 1, which depends on the clock), clamps paging parameters, and throws `VehicleNotFoundException` / `InvalidVehicleException`.
- **`VehicleRepository`:** Spring Data JPA, plus one JPQL `search` query for text and status filtering with pagination.
- **`GlobalExceptionHandler`:** turns exceptions into `{ message, errors }` JSON with status 400 or 404.
- **`DataSeeder`:** inserts the five demo vehicles when the table is empty.
- The validation rules mirror `validate()` in `VehicleForm.jsx`, so the API enforces the same rules as the form.

### Frontend structure

```
main.jsx
 └─ BrowserRouter
     └─ VehicleProvider            (context: vehicles summary + add/update/remove + list/get)
         └─ App                    (route table)
             └─ Layout             (top menu + <Outlet/> + footer)
                 ├─ /                    Home
                 ├─ /dashboard           Dashboard
                 ├─ /vehicles            Vehicles (paginated table, search, filter, delete)
                 ├─ /vehicles/new        VehicleFormPage -> VehicleForm
                 ├─ /vehicles/:id/edit   VehicleFormPage -> VehicleForm
                 └─ /about               About
```

### Data flow

- `api/vehiclesApi.js` is the only module that calls `fetch`. It converts form dates (`''`) to `null` and back, and turns failed responses into `ApiError` (with `status` and `fieldErrors`).
- `VehicleContext.jsx` exposes `useVehicles()`: `vehicles` (whole fleet, for the dashboard), `loading`, `error`, `listVehicles`, `getVehicle`, `addVehicle`, `updateVehicle`, `removeVehicle`. After each change it reloads the fleet and bumps a `version` so the Vehicles page refetches its current page.
- The Vehicles page asks the server for one page at a time (`page`, `size`, `q`, `status`). Changing the search or filter returns to page 1.
- Pages never call the API directly; they use `useVehicles()` only.

### Design decisions

- **Layered backend (controller / service / repository):** each layer has one job, so the service can be unit-tested with a mocked repository and the controller with a mocked service.
- **Server-side pagination and search:** the database does the filtering, so the UI scales beyond a few dozen vehicles. The page is wrapped in our own `PageResponse` record so the JSON shape is stable.
- **Same seam as Part 1:** `useVehicles()` kept its role. The reducer was replaced by API calls without rewriting the pages, apart from adding loading and error handling for async calls.
- **Validation in two places:** the form gives instant feedback, and the API enforces the same rules so it can't be bypassed.
- **H2 in memory:** no database setup is needed for the demo; data resets on every restart.
- **Vite proxy instead of CORS configuration:** the browser only talks to the dev server, so no cross-origin setup is needed.
- **Light palette defined as CSS variables** in `index.css`, so colors are changed in one place.

## Testing

Backend (`backend/`, `mvn test`), JUnit 5 + Mockito:

- `VehicleServiceTest` (Mockito mock repository): create, normalization, year bound, get by id, not found, list with filters and paging clamps, update, delete.
- `VehicleControllerTest` (`@WebMvcTest`, mocked service): every route, status codes, `Location` header, validation errors, 404s, pagination JSON.
- `VehicleRepositoryTest` (`@DataJpaTest`): search by plate, make, model and driver, status filter, combined filters, pagination.
- `DataSeederTest` (Mockito): seeds an empty database, skips a populated one.
- `FleetApplicationTests` (`@SpringBootTest`): the whole app starts, is seeded, and serves a paginated list.

Frontend (`frontend/`, `npm test`), Vitest + React Testing Library:

- `App.test.jsx`: menu and About page, list display, search and status filter, pagination, backend-unreachable error, delete with confirm and cancel, dashboard, add, server-side validation error, edit by id, unknown id, and `validate()`.
- `vehiclesApi.test.js`: request URLs and methods, date conversion, 204 handling, `ApiError` mapping, unreachable server.

UI tests render the real `App` in a `MemoryRouter` with a `VehicleProvider` that receives an in-memory fake API (`test/fakeApi.js`).
