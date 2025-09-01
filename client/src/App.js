import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store';
import { 
  PublicRoute, 
  ProtectedRoute, 
} from './middleware';
import Login from './components/Login';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import Clients from './components/Client';
import Area from './components/Area';
import User from './components/User';
import ComponentTest from './components/ComponentTest';

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute redirectTo="/dashboard">
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="clients"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="areas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Area />
            </ProtectedRoute>
          }
        />
        <Route
          path="test"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ComponentTest />
            </ProtectedRoute>
          }
        />
      </Route>
      
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </Provider>
  );
};

export default App;
