# Fleet Manager: Frontend

The React frontend for the company vehicles manager (SE411, Part 1). See the [main README](../README.md) for features and the [architecture document](../docs/architecture.md) for how it fits together.

## Scripts

Run these from this folder:

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm test        # run the tests once
npm run build   # production build into dist/
npm run lint    # oxlint
```

Run a single test:

```bash
npx vitest run src/test/App.test.jsx -t "adds a new vehicle"
```
