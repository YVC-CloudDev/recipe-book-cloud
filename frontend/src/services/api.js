
const API_BASE_URL = 'https://ydila2lajd.execute-api.eu-north-1.amazonaws.com';
const TOKEN_KEY = 'recipeBookToken';
const RESERVED_ADMIN_USERNAME = 'LANA MANAGER';

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

function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function normalizeUser(user, token) {
  return {
    id: user.userId,
    userId: user.userId,
    username: user.username,
    token
  };
}

function normalizeRecipe(recipe) {
  return {
    ...recipe,
    id: recipe.recipeId
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

function authHeaders() {
  const token = getToken();

  if (!token) {
    throw new Error('You must be logged in.');
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function registerUser({ username, password }) {
  const cleanUsername = validateUsername(username);
  const cleanPassword = validatePassword(password);

  await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: cleanUsername,
      password: cleanPassword
    })
  });

  return loginUser({
    username: cleanUsername,
    password: cleanPassword
  });
}

export async function loginUser({ username, password }) {
  const cleanUsername = validateUsername(username);
  const cleanPassword = validatePassword(password);

  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: cleanUsername,
      password: cleanPassword
    })
  });

  saveToken(data.token);

  return normalizeUser(data.user, data.token);
}

export async function getMyRecipes() {
  const data = await apiRequest('/recipes', {
    method: 'GET',
    headers: authHeaders()
  });

  return (data.recipes || []).map(normalizeRecipe);
}

export async function createRecipe(userId, recipeData) {
  const data = await apiRequest('/recipes', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: recipeData.name.trim(),
      ingredients: recipeData.ingredients.trim(),
      instructions: recipeData.instructions.trim(),
      category: recipeData.category
    })
  });

  return normalizeRecipe(data.recipe);
}

export async function updateRecipe(userId, recipeId, recipeData) {
  const data = await apiRequest(`/recipes/${recipeId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      name: recipeData.name.trim(),
      ingredients: recipeData.ingredients.trim(),
      instructions: recipeData.instructions.trim(),
      category: recipeData.category
    })
  });

  return normalizeRecipe(data.recipe);
}

export async function deleteRecipe(userId, recipeId) {
  await apiRequest(`/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  return { success: true };
}
