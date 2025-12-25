
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import ClassDetail from './views/ClassDetail';
import Analytics from './views/Analytics';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<div className="p-8 text-center text-gray-500">الإعدادات قريباً...</div>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
