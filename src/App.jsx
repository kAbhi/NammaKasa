import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { seedData } from './data/seed';
import LoginPage from './pages/LoginPage';
import ResidentPage from './pages/ResidentPage';
import WorkerPage from './pages/WorkerPage';
import AdminPage from './pages/AdminPage';

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
  useEffect(() => {
    seedData(); // idempotent – only runs once
  }, []);

  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
