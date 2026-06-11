# Recipe Book Cloud

A cloud-based personal recipe management application built with React and designed for deployment on AWS using a serverless architecture.

The application allows users to register, log in, and manage their own private collection of recipes.

## Project Status

### Completed

* React frontend
* Registration and login interface
* User input validation
* Personal recipe dashboard
* Add recipe functionality
* Edit recipe functionality
* Delete recipe functionality
* Confirmation before deleting a recipe
* Recipe categories with default images
* Mock API using browser storage
* DynamoDB database tables

### Planned AWS Integration

* AWS Lambda backend
* Amazon API Gateway
* AWS Secrets Manager
* IAM roles and permissions
* Amazon S3
* Amazon CloudFront
* Amazon Route 53
* AWS Certificate Manager
* Amazon CloudWatch
* GitHub Actions CI/CD

## Main Features

Users can:

* Register using a username and password
* Log in to their account
* Log out of the system
* View only their own recipes
* Add a new recipe
* Edit an existing recipe
* Delete a recipe
* Choose a category for each recipe
* View a default image according to the selected category

## User Validation

The registration process currently validates the following rules:

* Username is required
* Username must contain English letters and numbers only
* Username must be unique
* Password is required
* Password must contain at least 8 characters
* Password must use English characters
* Reserved usernames cannot be registered

The validation currently exists in the frontend mock service. It will also be implemented in the AWS Lambda backend so that it cannot be bypassed by sending requests directly to the API.

## Recipe Categories

The system supports the following categories:

* Starters
* Soups
* Main Dishes
* Side Dishes
* Desserts

Each category has a default image that is displayed on the recipe card.

## Technology Stack

### Frontend

* React
* JavaScript
* JSX
* CSS
* React Router
* Vite
* Lucide React

### Cloud and Backend

* AWS Lambda
* Amazon API Gateway
* Amazon DynamoDB
* AWS Secrets Manager
* AWS IAM
* Amazon S3
* Amazon CloudFront
* Amazon Route 53
* AWS Certificate Manager
* Amazon CloudWatch

### Development and Deployment

* Git
* GitHub
* GitHub Branches
* Pull Requests
* GitHub Actions
* CI/CD

## Project Structure

```text
recipe-book-cloud/
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
├── backend/
├── docs/
│   └── screenshots/
├── .github/
│   └── workflows/
├── .gitignore
└── README.md
```

Some folders will be added or expanded during the AWS integration and CI/CD stages.

## Running the Frontend Locally

Move into the frontend directory:

```bash
cd frontend
```

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Application Routes

| Route              | Purpose                               |
| ------------------ | ------------------------------------- |
| `/login`           | User login                            |
| `/register`        | User registration                     |
| `/dashboard`       | Displays the logged-in user's recipes |
| `/recipe/new`      | Creates a new recipe                  |
| `/recipe/:id/edit` | Edits or deletes an existing recipe   |

The dashboard and recipe pages are protected routes. Users who are not logged in are redirected to the login page.

## Current Mock API

The frontend currently uses a mock API service located at:

```text
frontend/src/services/api.js
```

It provides the following functions:

* `registerUser`
* `loginUser`
* `getMyRecipes`
* `createRecipe`
* `updateRecipe`
* `deleteRecipe`

The mock implementation temporarily stores users and recipes in the browser's `localStorage`.

The logged-in user's public information is temporarily stored in `sessionStorage`.

This mock logic will later be replaced with HTTP requests to AWS API Gateway.

## Planned API Endpoints

| Method   | Endpoint         | Purpose                                   |
| -------- | ---------------- | ----------------------------------------- |
| `POST`   | `/auth/register` | Register a new user                       |
| `POST`   | `/auth/login`    | Log in an existing user                   |
| `GET`    | `/recipes`       | Retrieve the authenticated user's recipes |
| `POST`   | `/recipes`       | Create a new recipe                       |
| `PUT`    | `/recipes/{id}`  | Update an existing recipe                 |
| `DELETE` | `/recipes/{id}`  | Delete an existing recipe                 |

## DynamoDB Database

The application uses two Amazon DynamoDB tables.

### RecipeBookUsers

Each item represents one registered user.

**Primary key**

```text
Partition key: username
Type: String
```

No sort key is required because every username must be unique and represents one user.

Example item:

```json
{
  "username": "lana123",
  "userId": "user-a1b2c3",
  "passwordHash": "secure-hashed-password",
  "createdAt": "2026-06-11T12:00:00Z"
}
```

Field meanings:

* `username` — unique name used during login
* `userId` — internal identifier generated automatically by the backend
* `passwordHash` — securely hashed version of the password
* `createdAt` — registration date and time

The plain password will not be stored in DynamoDB.

### RecipeBookRecipes

Each item represents one recipe.

**Primary key**

```text
Partition key: userId
Sort key: recipeId
```

The `userId` groups all recipes belonging to the same user.

The `recipeId` distinguishes between the different recipes belonging to that user.

Together, the following combination uniquely identifies a recipe:

```text
userId + recipeId
```

Example item:

```json
{
  "userId": "user-a1b2c3",
  "recipeId": "recipe-001",
  "name": "Chocolate Cake",
  "category": "Desserts",
  "ingredients": "Flour\nEggs\nSugar",
  "instructions": "Mix the ingredients\nBake for 35 minutes",
  "createdAt": "2026-06-11T12:30:00Z",
  "updatedAt": "2026-06-11T12:30:00Z"
}
```

This structure makes it possible to retrieve only the recipes belonging to the authenticated user and to identify a specific recipe for editing or deletion.

## Planned Serverless Architecture

```text
User
  |
  | HTTPS
  v
Route 53
  |
  v
CloudFront
  |
  v
S3 — React Frontend
  |
  | HTTPS API Requests
  v
API Gateway
  |
  v
Lambda
  |--------> DynamoDB
  |--------> Secrets Manager
  |
  v
CloudWatch Logs and Metrics
```

GitHub Actions will be used to build, test, and deploy the application automatically.

## Security Plan

The project will use the following security practices:

* Passwords will be stored only as secure hashes
* Secrets will not be stored in the React frontend
* Sensitive backend values will be stored in AWS Secrets Manager
* Lambda will use an IAM role with minimum required permissions
* Each user will be allowed to access only their own recipes
* The backend will derive the user identity from authentication data
* HTTPS will be enabled using CloudFront and AWS Certificate Manager
* AWS credentials and `.env` files will not be committed to GitHub

## Monitoring Plan

Amazon CloudWatch will be used for:

* Lambda execution logs
* Lambda invocation count
* Lambda errors
* Lambda execution duration
* API Gateway client and server errors
* CloudFront requests and error rates
* Monitoring dashboards
* Troubleshooting failed requests

## CI/CD Plan

GitHub Actions will be used for two main workflows.

### Continuous Integration

Runs when code is pushed or when a Pull Request is opened.

Planned steps:

```text
Checkout repository
Install dependencies
Build the React application
Run tests
```

### Continuous Deployment

Runs after changes are merged into the main branch.

Planned steps:

```text
Authenticate to AWS
Build the React application
Upload the build files to S3
Invalidate the CloudFront cache
Deploy backend updates
```

## Git Workflow

Development will use:

* A protected `main` branch
* Feature branches
* Clear commit messages
* Pull Requests
* GitHub Actions checks before merging

Example branches:

```text
feature/dynamodb
feature/secrets-iam
feature/lambda-api
feature/frontend-api
feature/cloudfront
feature/github-actions
feature/monitoring
feature/documentation
```

## Important Notes

* Do not commit `node_modules`
* Do not commit the `dist` folder
* Do not commit `.env` files
* Do not store AWS secrets in frontend code
* Do not store plain-text user passwords
