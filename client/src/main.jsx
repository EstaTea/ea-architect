import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 去掉 StrictMode：避免 Cytoscape 实例双重挂载
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
