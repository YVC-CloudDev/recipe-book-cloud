import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RecipeFormPage from './pages/RecipeFormPage.jsx';

function getSessionUser() {
  const savedUser = sessionStorage.getItem('recipeBookUser');
  return savedUser ? JSON.parse(savedUser) : null;
}

function ProtectedRoute({ children }) {
  return getSessionUser() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe/new"
          element={
            <ProtectedRoute>
              <RecipeFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe/:id/edit"
          element={
            <ProtectedRoute>
              <RecipeFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
