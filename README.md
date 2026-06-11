# Recipe Book

A simple pink personal recipe dashboard built with React, JavaScript, JSX, CSS, and React Router.

The app currently uses a mock API service in `src/services/api.js`. That file is intentionally separated so it can later be replaced with AWS API Gateway and Lambda calls.

## Run the project

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Routes

- `/login`
- `/register`
- `/dashboard`
- `/recipe/new`
- `/recipe/:id/edit`

## Mock API functions

The mock service exports:

- `registerUser`
- `loginUser`
- `getMyRecipes`
- `createRecipe`
- `updateRecipe`
- `deleteRecipe`

Future AWS endpoints can map to:

- `POST /auth/register`
- `POST /auth/login`
- `GET /recipes`
- `POST /recipes`
- `PUT /recipes/{id}`
- `DELETE /recipes/{id}`

No AWS secrets should be stored in the frontend.
