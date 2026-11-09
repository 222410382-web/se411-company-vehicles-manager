# Fleet Manager

A company vehicle asset management app for **SE411 (Fall 2026-27)**.

- **Part 1:** React frontend (`frontend/`).
- **Part 2:** Java Spring Boot REST backend with an H2 database (`backend/`), integrated with the frontend.

## Features

- **Home:** landing page describing the project, with an illustration.
- **Dashboard:** vehicle counts by status, and a list of vehicles whose insurance has expired or expires within 30 days.
- **Vehicles:** paginated table (5 per page, server-side) with search (plate, make, model, driver), status filter, edit, and delete (with confirmation).
- **Add / edit vehicle:** one validated form, used for both creating and updating. Editing loads the vehicle by id from the API.
- **About:** the team members with their student IDs.
- **Menu and footer:** top navigation between all pages, and a copyright footer.

Data is stored in an in-memory H2 database. It is re-created and re-seeded with five demo vehicles every time the backend starts.

## Tech stack

| Part | Stack |
|---|---|
| Frontend | React 19, Vite, React Router, Context API, plain CSS (light theme), Vitest + React Testing Library |
| Backend | Java 21+, Spring Boot 3.5 (Web, Data JPA, Validation), H2, JUnit 5 + Mockito |

## Getting started

Run the backend first, then the frontend (the Vite dev server proxies `/api` to `http://localhost:8080`).

```bash
# terminal 1: backend  (needs JDK 21+ and Maven)
cd backend
mvn spring-boot:run     # API on http://localhost:8080
mvn test                # backend tests

# terminal 2: frontend  (needs Node.js)
cd frontend
npm install
npm run dev             # http://localhost:5173
npm test
npm run build
npm run lint
```

## REST API

Base path `/api/vehicles` (page numbers are 0-based).

| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/vehicles` | Add a vehicle (JSON body) | 201 + `Location` + vehicle | 400 validation |
| GET | `/api/vehicles/{id}` | Get one vehicle by id | 200 + vehicle | 404 |
| GET | `/api/vehicles?page=0&size=10&q=&status=All` | Paginated list; optional text search `q` and `status` filter | 200 + page | |
| PUT | `/api/vehicles/{id}` | Update a vehicle (JSON body) | 200 + vehicle | 400, 404 |
| DELETE | `/api/vehicles/{id}` | Delete a vehicle | 204 | 404 |

A page looks like `{ "content": [...], "page": 0, "size": 10, "totalElements": 5, "totalPages": 1 }`.
Validation errors look like `{ "message": "Validation failed", "errors": { "plate": "Plate number is required" } }`.

## Project structure

```
frontend/
  src/
    api/vehiclesApi.js          the only code that calls the REST API
    context/VehicleContext.jsx  provider and useVehicles() hook
    data/statuses.js            the list of statuses
    components/                 Layout (menu), VehicleForm, StatusBadge
    pages/                      Home, Dashboard, Vehicles, VehicleFormPage, About
    test/                       UI tests, API client tests, fake API
  public/                       static files (hero image)
backend/
  src/main/java/com/se411/fleet/
    controller/                 VehicleController (REST routes)
    service/                    VehicleService (business rules)
    repository/                 VehicleRepository (Spring Data JPA)
    model/                      Vehicle entity
    dto/                        VehicleRequest, PageResponse
    exception/                  not-found / validation errors and the global handler
    config/                     DataSeeder (demo data)
  src/test/java/...             JUnit 5 + Mockito tests
docs/architecture.md            architecture, decisions and tests
```

Pages read and change data only through `useVehicles()`. That hook is the single seam between the UI and the backend.

## Team

| Name | Student ID |
|---|---|
| Fajer Alkhamash | 221410091 |
| Asayil Alluhib | 222410382 |
| Haifa Alajlan | 222410267 |
| Nisreen Almutairi | 221511326 |
