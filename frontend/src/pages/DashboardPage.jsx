import React from 'react';
import { Edit3, LogOut, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryImages } from '../data/categories.js';
import { getMyRecipes } from '../services/api.js';

function getSessionUser() {
  return JSON.parse(sessionStorage.getItem('recipeBookUser'));
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user] = useState(getSessionUser);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const myRecipes = await getMyRecipes(user.id);
        setRecipes(myRecipes);
      } catch (currentError) {
        setError(currentError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, [user.id]);

  function logout() {
    sessionStorage.removeItem('recipeBookUser');
    navigate('/login');
  }

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <div>
          <h1>Welcome {user.username}</h1>
        </div>
        <button className="ghost-button" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <section className="dashboard-toolbar">
        <h2>My Recipes</h2>
        <button className="primary-button small-button" onClick={() => navigate('/recipe/new')}>
          <Plus size={18} />
          Add New Recipe
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}
      {isLoading && <p className="empty-state">Loading your recipes...</p>}

      {!isLoading && recipes.length === 0 && (
        <section className="empty-state">
          <h3>No recipes yet</h3>
          <p>Add your first favorite recipe and it will appear here.</p>
        </section>
      )}

      <section className="recipe-grid" aria-label="My recipe cards">
        {recipes.map((recipe) => (
          <article className="recipe-card" key={recipe.id}>
            <img src={categoryImages[recipe.category]} alt={`${recipe.category} recipe`} />
            <div className="recipe-card-body">
              <div>
                <p className="category-pill">{recipe.category}</p>
                <h3>{recipe.name}</h3>
              </div>
              <button
                className="icon-button"
                aria-label={`Edit ${recipe.name}`}
                onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                type="button"
              >
                <Edit3 size={18} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
