# Fleet Manager: Architecture, Stack and Features

SE411 (Fall 2026-27), Part 1. A frontend-only React app for managing company vehicles. Data is held in memory, with no database. A backend comes in Part 2.

## Technology stack

| Concern | Choice |
|---|---|
| UI library | React 19 |
| Build tool / dev server | Vite |
| Routing | React Router (`BrowserRouter`, nested routes with a shared layout) |
| State | `useReducer` + React Context |
| Styling | Plain CSS with custom properties, light theme only |
| Tests | Vitest, React Testing Library, jsdom |
| Lint | oxlint |

## Features

1. **Home:** landing page with a project description, feature highlights and links into the app.
2. **Dashboard:** total vehicles, counts per status (Active, In Maintenance, Retired), and vehicles whose insurance has expired or expires within 30 days (retired vehicles excluded).
3. **List / display:** table of all vehicles with search (plate, make, model, driver) and a status filter.
4. **Add:** validated form (plate, make and model required; year 1980 to next year; mileage 0 or more). Plates are stored upper-case.
5. **Update:** the same form, pre-filled, reached from each row's Edit button.
6. **Remove:** Delete button with a confirmation prompt.
7. **Menu and footer:** top navigation to Home, Dashboard, Vehicles, Add Vehicle and About, plus a copyright footer.
8. **About:** team members with names and student IDs.

## Vehicle record

`id`, `plate`, `make`, `model`, `year`, `mileage`, `driver`, `lastService`, `insuranceExpiry`, `status`. Seed data is in `frontend/src/data/seedVehicles.js` and is restored on every page reload.

## Architecture

```
main.jsx
 └─ BrowserRouter
     └─ VehicleProvider            (context: vehicles + add/update/remove)
         └─ App                    (route table)
             └─ Layout             (top menu + <Outlet/> + footer)
                 ├─ /                    Home
                 ├─ /dashboard           Dashboard
                 ├─ /vehicles            Vehicles (table, search, filter, delete)
                 ├─ /vehicles/new        VehicleFormPage -> VehicleForm
                 ├─ /vehicles/:id/edit   VehicleFormPage -> VehicleForm
                 └─ /about               About
```

### Data flow

- `vehiclesReducer.js` is a pure function handling `add`, `update` and `remove`. New ids are the current highest id plus one.
- `VehicleContext.jsx` wraps the reducer and exposes `{ vehicles, addVehicle, updateVehicle, removeVehicle }` through the `useVehicles()` hook.
- Pages never touch the reducer or the seed data directly. They use `useVehicles()` only.
- `VehicleFormPage` decides between add and edit from the `:id` route parameter, then navigates back to `/vehicles` after saving.

### Design decisions

- **Context + reducer instead of a state library:** the app is small and has one entity, so no extra dependency is needed.
- **Pure reducer in its own file:** it is unit-testable without rendering anything.
- **Single access point (`useVehicles`):** in Part 2 the backend integration can replace what sits behind the hook (for example, API calls instead of the reducer) without rewriting the pages.
- **Validation lives with the form** (`validate()` in `VehicleForm.jsx`) and is exported so it can be tested directly.
- **Light palette defined as CSS variables** in `index.css`, so colors are changed in one place.

## Testing

Tests live in `frontend/src/test/` and run with `npm test`:

- `vehiclesReducer.test.js`: add, update, remove, id assignment, unknown actions.
- `App.test.jsx`: menu and About page, list display, search and status filter, delete with confirm and cancel, add, edit, validation errors, unknown id, and `validate()`.

UI tests render the real `App` inside a `MemoryRouter` and a `VehicleProvider` with fixed test data.
