# Fleet Manager

A company vehicle asset management app for **SE411 (Fall 2026-27), Part 1**. It is a React frontend only. Vehicle data lives in an in-memory collection, with no database. A backend will be added in Part 2.

## Features

- **Home:** landing page describing the project, with an illustration.
- **Dashboard:** vehicle counts by status, and a list of vehicles whose insurance has expired or expires within 30 days.
- **Vehicles:** table of all vehicles with search (plate, make, model, driver), status filter, edit, and delete (with confirmation).
- **Add / edit vehicle:** one validated form, used for both creating and updating.
- **About:** the team members with their student IDs.
- **Menu and footer:** top navigation between all pages, and a copyright footer.

Data is reset to the seed data in `src/data/seedVehicles.js` whenever the page is reloaded.

## Tech stack

- React 19 + Vite
- React Router (client-side navigation)
- State: `useReducer` + React Context
- Plain CSS, light theme
- Tests: Vitest, React Testing Library, jsdom
- Lint: oxlint

## Getting started

```bash
cd frontend
npm install
npm run dev        # start the dev server
npm test           # run the tests once
npm run build      # production build
npm run lint
```

## Project structure

```
frontend/
  src/
    data/seedVehicles.js        seed data and the list of statuses
    context/
      vehiclesReducer.js        pure add / update / remove logic
      VehicleContext.jsx        provider and useVehicles() hook
    components/                 Layout (menu), VehicleForm, StatusBadge
    pages/                      Home, Dashboard, Vehicles, VehicleFormPage, About
  public/                       static files (hero image)
    test/                       reducer and UI tests
backend/                        reserved for Part 2
```

Pages read and change data only through `useVehicles()`. In Part 2, the backend integration can replace the reducer behind that hook without touching the pages.

## Team

| Name | Student ID |
|---|---|
| Fajer Alkhamash | 221410091 |
| Asayil Alluhib | 222410382 |
| Haifa Alajlan | 222410267 |
| Nisreen Almutairi | 221511326 |
