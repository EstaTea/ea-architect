import React, { useEffect } from 'react';
import AppShell from './components/AppShell.jsx';
import useStore from './store.js';

export default function App() {
  const loadData = useStore(s => s.loadData);
  const loading = useStore(s => s.loading);
  const setCurrentView = useStore(s => s.setCurrentView);

  useEffect(() => {
    loadData();
    // 支持 ?view=capability 或 ?view=integration 从外部控制初始视图
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'integration' || view === 'capability') {
      setCurrentView(view);
    }
  }, [loadData, setCurrentView]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#666' }}>
        Loading architecture data...
      </div>
    );
  }

  return <AppShell />;
}
