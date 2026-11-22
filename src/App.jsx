import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { seedData } from './data/seed';
import LoginPage from './pages/LoginPage';
import ResidentPage from './pages/ResidentPage';
import WorkerPage from './pages/WorkerPage';
import AdminPage from './pages/AdminPage';

// Seed before anything renders so LoginPage has data on first paint
seedData();

function AppRouter() {
  const { currentUser } = useApp();

  if (!currentUser) return <LoginPage />;

  switch (currentUser.role) {
    case 'resident': return <ResidentPage />;
    case 'worker': return <WorkerPage />;
    case 'admin': return <AdminPage />;
    default: return <LoginPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
