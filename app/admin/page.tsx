'use client';

import { useUser } from '@clerk/nextjs';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-[var(--color-bg-deepest)]" style={{ minHeight: 'calc(100vh / 1.25)' }}>
        <div className="text-[var(--color-text-dimmed)] text-sm">Loading...</div>
      </div>
    );
  }

  const role = (user?.publicMetadata as { role?: string })?.role;

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center bg-[var(--color-bg-deepest)]" style={{ minHeight: 'calc(100vh / 1.25)' }}>
        <div className="text-center">
          <h1 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Access Denied</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">You do not have admin privileges.</p>
          <a
            href="/"
            className="text-sm text-[#FF6C37] hover:underline"
          >
            Back to Trainer
          </a>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
