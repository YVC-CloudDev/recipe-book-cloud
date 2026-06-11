import React from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categories } from '../data/categories.js';
import {
  createRecipe,
  deleteRecipe,
  getMyRecipes,
  updateRecipe
} from '../services/api.js';

const emptyRecipe = {
  name: '',
  ingredients: '',
  instructions: '',
  category: 'Starters'
};

function getSessionUser() {
  return JSON.parse(sessionStorage.getItem('recipeBookUser'));
}

export default function RecipeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [user] = useState(getSessionUser);
  const [form, setForm] = useState(emptyRecipe);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    async function loadRecipe() {
      if (!isEditing) {
        return;
      }

      try {
        const recipes = await getMyRecipes(user.id);
        const recipe = recipes.find((currentRecipe) => currentRecipe.id === id);

        if (!recipe) {
          throw new Error('Recipe was not found.');
        }

        setForm({
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          category: recipe.category
        });
      } catch (currentError) {
        setError(currentError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipe();
  }, [id, isEditing, user.id]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function validateRecipe() {
    if (!form.name.trim()) {
      throw new Error('Recipe name is required.');
    }

    if (!form.ingredients.trim()) {
      throw new Error('Ingredients are required.');
    }

    if (!form.instructions.trim()) {
      throw new Error('Preparation instructions are required.');
    }
  }

  async function saveRecipe(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      validateRecipe();

      if (isEditing) {
        await updateRecipe(user.id, id, form);
      } else {
        await createRecipe(user.id, form);
      }

      navigate('/dashboard');
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeRecipe() {
    const confirmed = window.confirm('Are you sure you want to delete this recipe?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecipe(user.id, id);
      navigate('/dashboard');
    } catch (currentError) {
      setError(currentError.message);
    }
  }

  return (
    <main className="app-shell">
      <button className="ghost-button back-button" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} />
        Back
      </button>

      <section className="recipe-form-layout">
        <form className="editor-panel" onSubmit={saveRecipe}>
          <p className="eyebrow">My kitchen notes</p>
          <h1>{isEditing ? 'Edit Recipe' : 'Add Recipe'}</h1>

          {isLoading ? (
            <p className="empty-state">Loading recipe...</p>
          ) : (
            <>
              <label>
                Recipe name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Pink pasta, birthday cake..."
                />
              </label>

              <label>
                Ingredients
                <textarea
                  name="ingredients"
                  value={form.ingredients}
                  onChange={updateField}
                  placeholder="Write each ingredient on a new line"
                  rows="6"
                />
              </label>

              <label>
                Preparation instructions
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={updateField}
                  placeholder="Describe the steps"
                  rows="7"
                />
              </label>

              <label>
                Category
                <select name="category" value={form.category} onChange={updateField}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              {error && <p className="error-message">{error}</p>}

              <div className="form-actions">
                <button className="primary-button" type="submit" disabled={isSubmitting}>
                  <Save size={18} />
                  {isSubmitting ? 'Saving...' : 'Save Recipe'}
                </button>

                {isEditing && (
                  <button className="danger-button" onClick={removeRecipe} type="button">
                    <Trash2 size={18} />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}
