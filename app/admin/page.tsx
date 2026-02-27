'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-token');
    if (saved) setToken(saved);
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-token');
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
