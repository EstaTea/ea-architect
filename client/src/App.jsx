import React, { useEffect, useRef } from 'react';
import AppShell from './components/AppShell.jsx';
import useStore from './store.js';

export default function App() {
  const loadData = useStore(s => s.loadData);
  const loading = useStore(s => s.loading);
  const setCurrentView = useStore(s => s.setCurrentView);
  const canvasRefMap = useRef({});

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'integration' || view === 'capability') {
      setCurrentView(view);
    }

    // 监听来自父页面（FSL工作台 iframe）的消息，收到 'ea:fit' 时触发重排
    const handleMessage = (e) => {
      if (e.data === 'ea:fit') {
        // 通知当前激活的 canvas ref 执行 fit+layout
        window.dispatchEvent(new CustomEvent('ea-refit'));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
