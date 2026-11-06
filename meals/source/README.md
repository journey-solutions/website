# Meal Fund source

`src/app.js` is the app, `src/template.html` the page and styles. The build inlines the app and the Firebase SDK into `../index.html`.

```
npm install
node build.mjs          # writes ../index.html
node build.mjs --test   # writes test/index.html using the fake Firebase in mock/ (no network needed)
```

## Data

- `users/{uid}/settings/main`
  - `setupDone`: whether the person has finished the setup screen. Setup opens automatically until this is set.
  - `defaultEaters`, `defaultAllowance`
  - `multiMeals`: whether "More than one meal on some days" is ticked.
  - `schedule`: `{"0": ["brunch"], "1": [], "2": ["dinner", "other"], ...}`, where the key is the day of the week (0 = Sunday) and the list holds the meal types for that day.
  - `dinnerCost`, `brunchCost`, `otherCost`
- `users/{uid}/months/{YYYY-MM}`
  - `allowance`, `usual`: values for that month only. Each falls back to the default when not set.
  - `meals.{YYYY-MM-DD}`: the first meal of a day. Later meals on the same day use `{YYYY-MM-DD}_1` and `_2`. Each entry is `{status, people, spent, type}`.

Logged meals stay in the list after the schedule changes.
