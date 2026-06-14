# Recipe Book Cloud

A cloud-based personal recipe management application built with React and deployed on AWS using a serverless architecture.

The system allows users to register, log in, and manage their own private recipe collection. Each authenticated user can create, view, update, and delete only their own recipes.

---

## Live Application

**Live URL:**
https://recipebook.proj.rotem.click

---

## GitHub Repository

**Repository:**
https://github.com/YVC-CloudDev/recipe-book-cloud

---

## Project Overview

Recipe Book Cloud is a serverless web application for managing personal recipes.

Users can:

* Register with a username and password
* Log in securely
* Add new recipes
* View their own recipes
* Edit existing recipes
* Delete recipes
* Store recipes by category

The application includes both a frontend and backend:

* The frontend is a React application hosted as a static website.
* The backend is implemented using AWS Lambda functions exposed through API Gateway.
* Data is stored in Amazon DynamoDB.
* Authentication is handled using JWT tokens.

---

## Main Features

* User registration
* User login
* JWT-based authentication
* Private recipes per user
* Create recipe
* Read user recipes
* Update recipe
* Delete recipe
* Recipe categories
* Custom HTTPS domain
* Serverless backend
* CI/CD deployment using GitHub Actions

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* AWS Lambda
* Amazon API Gateway
* Amazon DynamoDB
* AWS Secrets Manager

### Cloud & Deployment

* Amazon S3
* Amazon CloudFront
* Amazon Route 53
* AWS Certificate Manager
* AWS IAM
* Amazon CloudWatch
* GitHub Actions

---

## Architecture

The project uses a serverless architecture.

```text
User / Browser
      ↓
Amazon Route 53
      ↓
Amazon CloudFront
      ↓
Amazon S3
Static React Frontend
      ↓
Amazon API Gateway
      ↓
AWS Lambda
      ↓
Amazon DynamoDB
```

Supporting services:

```text
AWS Certificate Manager → HTTPS certificate for CloudFront
AWS Secrets Manager → JWT secret
AWS IAM → permissions for Lambda and GitHub Actions
Amazon CloudWatch → logs and metrics
GitHub Actions → CI/CD deployment
```

---

## AWS Services Used

### Amazon S3

Amazon S3 is used to host the static React frontend.

After running the React build process, the generated files are uploaded to the S3 bucket:

```text
recipe-book-frontend-lana
```

The bucket contains:

```text
index.html
assets/
```

S3 is used because the frontend is static after build and can be served as HTML, CSS, JavaScript, and image files.

---

### Amazon CloudFront

Amazon CloudFront is used in front of the S3 bucket.

CloudFront provides:

* HTTPS delivery
* Caching
* Better performance
* Connection to the custom domain

CloudFront serves the frontend through the final domain:

```text
https://recipebook.proj.rotem.click
```

CloudFront also uses cache invalidation after each deployment so users receive the latest version of the frontend.

---

### Amazon Route 53

Amazon Route 53 is used for DNS routing.

The custom domain:

```text
recipebook.proj.rotem.click
```

is routed to the CloudFront distribution.

Route 53 contains DNS records that point the domain to CloudFront.

---

### AWS Certificate Manager

AWS Certificate Manager is used to create and manage the SSL/TLS certificate for HTTPS.

The certificate was created for:

```text
recipebook.proj.rotem.click
```

The certificate was created in:

```text
us-east-1
```

This is required because CloudFront uses certificates from the `us-east-1` region.

The certificate was validated using DNS validation through Route 53.

---

### Amazon API Gateway

Amazon API Gateway exposes the backend as an HTTP API.

The React frontend sends requests to API Gateway, and API Gateway routes each request to the correct Lambda function.

API Gateway routes:

```text
POST    /auth/register
POST    /auth/login
GET     /recipes
POST    /recipes
PUT     /recipes/{id}
DELETE  /recipes/{id}
```

CORS was configured to allow requests from:

```text
http://localhost:5173
https://recipebook.proj.rotem.click
```

Allowed methods:

```text
GET, POST, PUT, DELETE, OPTIONS
```

Allowed headers:

```text
Content-Type
Authorization
```

---

### AWS Lambda

AWS Lambda is used for backend logic.

The project uses three Lambda functions:

```text
RecipeBookRegister
RecipeBookLogin
RecipeBookRecipes
```

#### RecipeBookRegister

Handles user registration.

Route:

```text
POST /auth/register
```

Responsibilities:

* Validate username and password
* Prevent duplicate usernames
* Hash passwords before saving
* Store new users in DynamoDB

#### RecipeBookLogin

Handles user login.

Route:

```text
POST /auth/login
```

Responsibilities:

* Validate login input
* Read the user from DynamoDB
* Verify the password
* Generate a JWT token
* Return the token to the frontend

#### RecipeBookRecipes

Handles all recipe operations.

Routes:

```text
GET     /recipes
POST    /recipes
PUT     /recipes/{id}
DELETE  /recipes/{id}
```

Responsibilities:

* Verify JWT token
* Extract userId from the token
* Get user recipes
* Create new recipes
* Update existing recipes
* Delete recipes
* Ensure users can only access their own recipes

---

### Amazon DynamoDB

Amazon DynamoDB is used as the database.

The project uses two DynamoDB tables:

#### RecipeBookUsers

Stores user accounts.

Primary key:

```text
username
```

Example fields:

```text
username
userId
passwordHash
createdAt
```

#### RecipeBookRecipes

Stores user recipes.

Primary key:

```text
userId
```

Sort key:

```text
recipeId
```

Example fields:

```text
userId
recipeId
name
ingredients
instructions
category
createdAt
updatedAt
```

This design allows each user to have multiple recipes while keeping every user’s recipes separate.

---

### AWS Secrets Manager

AWS Secrets Manager is used to store the JWT secret.

The JWT secret is not stored in the frontend or directly in the source code.

The Lambda functions use the secret to:

* Sign JWT tokens during login
* Verify JWT tokens during authenticated recipe requests

Secret name:

```text
recipe-book/jwt-secret
```

---

### AWS IAM

AWS IAM is used to manage permissions between services.

The project uses IAM roles for secure access.

#### RecipeBookLambdaRole

Used by the Lambda functions.

This role gives Lambda permission to:

* Read and write to DynamoDB
* Read the JWT secret from Secrets Manager
* Write logs to CloudWatch

#### GitHubActionsRecipeBookDeployRole

Used by GitHub Actions for CI/CD deployment.

This role allows GitHub Actions to:

* Upload the frontend build files to S3
* Delete old files from the S3 bucket during deployment
* Create a CloudFront invalidation after deployment

The GitHub Actions role uses OIDC, so no permanent AWS access keys are stored in GitHub.

---

### Amazon CloudWatch

Amazon CloudWatch is used for logs and monitoring.

Lambda functions send logs and metrics to CloudWatch.

CloudWatch helps monitor:

* Lambda invocations
* Errors
* Duration
* Execution logs

This makes it possible to debug backend issues and verify that the serverless functions are running correctly.

---

## Authentication Flow

The application uses JWT-based authentication.

```text
User logs in
      ↓
React sends username and password to API Gateway
      ↓
API Gateway invokes RecipeBookLogin Lambda
      ↓
Lambda verifies the user in DynamoDB
      ↓
Lambda creates a JWT token using the JWT secret
      ↓
React stores the token in sessionStorage
      ↓
React sends the token in the Authorization header for recipe requests
```

Authorization header format:

```text
Authorization: Bearer <token>
```

The backend does not trust a userId sent from the frontend.
Instead, the Lambda function extracts the userId from the verified JWT token.

---

## Recipe Flow

### Get Recipes

```text
React
↓
GET /recipes
↓
API Gateway
↓
RecipeBookRecipes Lambda
↓
Verify JWT token
↓
Query DynamoDB by userId
↓
Return only the user's recipes
```

### Create Recipe

```text
React
↓
POST /recipes
↓
API Gateway
↓
RecipeBookRecipes Lambda
↓
Verify JWT token
↓
Create recipeId
↓
Save recipe in DynamoDB
```

### Update Recipe

```text
React
↓
PUT /recipes/{id}
↓
API Gateway
↓
RecipeBookRecipes Lambda
↓
Verify JWT token
↓
Update recipe by userId + recipeId
```

### Delete Recipe

```text
React
↓
DELETE /recipes/{id}
↓
API Gateway
↓
RecipeBookRecipes Lambda
↓
Verify JWT token
↓
Delete recipe by userId + recipeId
```

---

## API Endpoints

Base API URL:

```text
https://ydila2lajd.execute-api.eu-north-1.amazonaws.com
```

### Register

```text
POST /auth/register
```

Request body:

```json
{
  "username": "testuser",
  "password": "Password123!"
}
```

### Login

```text
POST /auth/login
```

Request body:

```json
{
  "username": "testuser",
  "password": "Password123!"
}
```

Response includes:

```json
{
  "message": "Login successful.",
  "token": "JWT_TOKEN",
  "user": {
    "userId": "user-id",
    "username": "testuser"
  }
}
```

### Get Recipes

```text
GET /recipes
```

Requires:

```text
Authorization: Bearer <token>
```

### Create Recipe

```text
POST /recipes
```

Requires:

```text
Authorization: Bearer <token>
```

Request body:

```json
{
  "name": "Chocolate Cake",
  "ingredients": "Flour\nEggs\nSugar",
  "instructions": "Mix ingredients\nBake for 35 minutes",
  "category": "Desserts"
}
```

### Update Recipe

```text
PUT /recipes/{id}
```

Requires:

```text
Authorization: Bearer <token>
```

### Delete Recipe

```text
DELETE /recipes/{id}
```

Requires:

```text
Authorization: Bearer <token>
```

---

## CI/CD with GitHub Actions

The project uses GitHub Actions for CI/CD.

Workflow file:

```text
.github/workflows/frontend-build.yml
```

Workflow name:

```text
Frontend CI/CD
```

### Pull Request Behavior

When a pull request is opened, GitHub Actions:

```text
Checks out the repository
Sets up Node.js
Installs frontend dependencies
Builds the React frontend
```

This verifies that the frontend can be built successfully before merging into `main`.

### Main Branch Deployment

After changes are merged into `main`, GitHub Actions:

```text
Builds the React frontend
Uploads the dist folder to S3
Invalidates the CloudFront cache
Updates the live website automatically
```

Deployment target:

```text
S3 bucket: recipe-book-frontend-lana
CloudFront distribution: E34JIA9ZKXL0T
```

This creates a complete CI/CD flow:

```text
Pull Request
↓
Build validation
↓
Merge to main
↓
Build frontend
↓
Deploy to S3
↓
Invalidate CloudFront
↓
Live website updated
```

---

## Local Development

### Prerequisites

* Node.js
* npm
* Git

### Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

The local frontend runs on:

```text
http://localhost:5173
```

### Build the frontend

```bash
cd frontend
npm run build
```

This creates the production build in:

```text
frontend/dist
```

---

## Deployment Process

The frontend deployment process is now automated with GitHub Actions.

Manual deployment process used during setup:

```text
Run npm run build
Upload dist files to S3
Enable S3 Static Website Hosting
Configure CloudFront
Attach ACM certificate
Route custom domain through Route 53
Configure API Gateway CORS
```

Current automated deployment process:

```text
Push or merge changes to main
GitHub Actions runs
React frontend is built
dist files are synced to S3
CloudFront cache is invalidated
Live site updates automatically
```

---

## Security Decisions

* Passwords are hashed before being stored.
* JWT is used for authenticated recipe requests.
* JWT secret is stored in AWS Secrets Manager.
* Users can only access recipes linked to their own userId.
* Lambda extracts userId from the verified token, not from frontend input.
* IAM roles are used to limit service permissions.
* HTTPS is enabled using CloudFront and ACM.
* GitHub Actions uses OIDC with an IAM role instead of permanent AWS access keys.

---

## Monitoring

Amazon CloudWatch is used for monitoring backend behavior.

CloudWatch provides:

* Lambda execution logs
* Invocation metrics
* Error metrics
* Duration metrics

This helps verify that the serverless backend is running correctly and allows debugging if an issue occurs.

---

## Project Structure

```text
recipe-book-cloud
├── .github
│   └── workflows
│       └── frontend-build.yml
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Technical Decisions

### Serverless Architecture

The project uses a serverless architecture to avoid managing servers manually. AWS Lambda, API Gateway, DynamoDB, and S3 allow the application to scale without managing infrastructure.

### One Lambda for Recipe CRUD

All recipe operations are handled by one Lambda function:

```text
RecipeBookRecipes
```

This keeps related recipe logic together because all recipe operations use the same table, token validation, and user authorization logic.

### Separate Authentication Functions

Registration and login are separated into their own Lambda functions:

```text
RecipeBookRegister
RecipeBookLogin
```

This keeps authentication logic clear and separated from recipe management.

### DynamoDB Table Design

Users and recipes are stored in separate tables.

The recipes table uses:

```text
Partition key: userId
Sort key: recipeId
```

This allows each user to have multiple recipes and makes it easy to query only the recipes of the authenticated user.

### CloudFront in Front of S3

CloudFront is used in front of S3 to provide HTTPS, caching, and custom domain support.

### GitHub Actions CI/CD

GitHub Actions automates the frontend deployment process, reducing manual deployment steps and ensuring that the live website updates after changes are merged into the main branch.

---

## Challenges and Solutions

### CORS Error

Problem:

The React frontend was blocked by the browser when trying to call API Gateway.

Solution:

Configured CORS in API Gateway to allow:

```text
http://localhost:5173
https://recipebook.proj.rotem.click
```

Allowed headers:

```text
Content-Type
Authorization
```

Allowed methods:

```text
GET, POST, PUT, DELETE, OPTIONS
```

---

### CloudFront and HTTPS

Problem:

The S3 website endpoint worked with HTTP, but the final application needed HTTPS.

Solution:

Configured CloudFront in front of S3, requested an ACM certificate, validated it using Route 53, and connected the custom domain to CloudFront.

---

### React Routing with S3

Problem:

React is a single-page application, and refreshing internal routes can cause S3 to return an error.

Solution:

Configured S3 Static Website Hosting with:

```text
Index document: index.html
Error document: index.html
```

This allows React to handle routing in the browser.

---

### CloudFront Cache

Problem:

After deploying new frontend files, CloudFront may still serve cached old files.

Solution:

Added CloudFront invalidation to the GitHub Actions deployment workflow.

---

### Secure GitHub Actions Deployment

Problem:

GitHub Actions needed access to AWS for deployment, but storing permanent AWS keys in GitHub is not ideal.

Solution:

Configured OIDC between GitHub and AWS and created an IAM role:

```text
GitHubActionsRecipeBookDeployRole
```

GitHub Actions assumes this role temporarily during deployment.

---

## Final Status

Completed:

* React frontend
* AWS serverless backend
* API Gateway routes
* Lambda backend logic
* DynamoDB data storage
* JWT authentication
* Secrets Manager integration
* S3 static hosting
* CloudFront distribution
* Route 53 custom domain
* ACM HTTPS certificate
* CORS configuration
* CloudWatch logs and metrics
* GitHub repository
* Pull requests and branches
* GitHub Actions CI/CD
* Live HTTPS application

Live application:

```text
https://recipebook.proj.rotem.click
```
