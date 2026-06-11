const USERS_KEY = 'recipeBookMockUsers';
const RECIPES_KEY = 'recipeBookMockRecipes';
const RESERVED_ADMIN_USERNAME = 'LANA MANAGER';

// Add the AWS API Gateway base URL here later.
// Example: const API_BASE_URL = 'https://your-api-id.execute-api.region.amazonaws.com/prod';
// Do not store AWS secrets in frontend code.

function waitForMockNetwork() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

function readCollection(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function validateUsername(username) {
  const trimmed = username.trim();

  if (!trimmed) {
    throw new Error('Username is required.');
  }

  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    throw new Error('Username must contain English letters and numbers only.');
  }

  if (normalizeUsername(trimmed) === RESERVED_ADMIN_USERNAME.toLowerCase()) {
    throw new Error('This username is reserved and cannot be used.');
  }

  return trimmed;
}

function validatePassword(password) {
  if (!password) {
    throw new Error('Password is required.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  if (!/^[\x20-\x7E]+$/.test(password)) {
    throw new Error('Password must use English characters only.');
  }

  return password;
}

function withoutPassword(user) {
  return {
    id: user.id,
    username: user.username
  };
}

export async function registerUser({ username, password }) {
  await waitForMockNetwork();

  const cleanUsername = validateUsername(username);
  const cleanPassword = validatePassword(password);
  const users = readCollection(USERS_KEY);
  const usernameExists = users.some(
    (user) => normalizeUsername(user.username) === normalizeUsername(cleanUsername)
  );

  if (usernameExists) {
    throw new Error('Username already exists. Please choose another one.');
  }

  const newUser = {
    id: createId('user'),
    username: cleanUsername,
    password: cleanPassword
  };

  writeCollection(USERS_KEY, [...users, newUser]);
  return withoutPassword(newUser);
}

export async function loginUser({ username, password }) {
  await waitForMockNetwork();

  const cleanUsername = validateUsername(username);
  validatePassword(password);

  const users = readCollection(USERS_KEY);
  const user = users.find(
    (savedUser) =>
      normalizeUsername(savedUser.username) === normalizeUsername(cleanUsername) &&
      savedUser.password === password
  );

  if (!user) {
    throw new Error('Incorrect username or password.');
  }

  return withoutPassword(user);
}

export async function getMyRecipes(userId) {
  await waitForMockNetwork();

  return readCollection(RECIPES_KEY)
    .filter((recipe) => recipe.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function createRecipe(userId, recipeData) {
  await waitForMockNetwork();

  const now = new Date().toISOString();
  const recipes = readCollection(RECIPES_KEY);
  const recipe = {
    id: createId('recipe'),
    userId,
    name: recipeData.name.trim(),
    ingredients: recipeData.ingredients.trim(),
    instructions: recipeData.instructions.trim(),
    category: recipeData.category,
    createdAt: now,
    updatedAt: now
  };

  writeCollection(RECIPES_KEY, [...recipes, recipe]);
  return recipe;
}

export async function updateRecipe(userId, recipeId, recipeData) {
  await waitForMockNetwork();

  const now = new Date().toISOString();
  const recipes = readCollection(RECIPES_KEY);
  const existingRecipe = recipes.find(
    (recipe) => recipe.id === recipeId && recipe.userId === userId
  );

  if (!existingRecipe) {
    throw new Error('Recipe was not found.');
  }

  const updatedRecipes = recipes.map((recipe) => {
    if (recipe.id !== recipeId || recipe.userId !== userId) {
      return recipe;
    }

    return {
      ...recipe,
      name: recipeData.name.trim(),
      ingredients: recipeData.ingredients.trim(),
      instructions: recipeData.instructions.trim(),
      category: recipeData.category,
      updatedAt: now
    };
  });

  writeCollection(RECIPES_KEY, updatedRecipes);
  return updatedRecipes.find((recipe) => recipe.id === recipeId);
}

export async function deleteRecipe(userId, recipeId) {
  await waitForMockNetwork();

  const recipes = readCollection(RECIPES_KEY);
  const recipeExists = recipes.some(
    (recipe) => recipe.id === recipeId && recipe.userId === userId
  );

  if (!recipeExists) {
    throw new Error('Recipe was not found.');
  }

  writeCollection(
    RECIPES_KEY,
    recipes.filter((recipe) => recipe.id !== recipeId || recipe.userId !== userId)
  );

  return { success: true };
}
