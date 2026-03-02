import { currentUser } from '@clerk/nextjs/server';

export async function checkAdmin(): Promise<boolean> {
  const user = await currentUser();
  return (user?.publicMetadata as Record<string, unknown>)?.role === 'admin';
}

export const checkAuth = checkAdmin;
