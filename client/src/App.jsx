import React, { useEffect } from 'react';
import AppShell from './components/AppShell.jsx';
import useStore from './store.js';

export default function App() {
  const loadData = useStore(s => s.loadData);
  const loading = useStore(s => s.loading);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#666' }}>
        Loading architecture data...
      </div>
    );
  }

  return <AppShell />;
}
