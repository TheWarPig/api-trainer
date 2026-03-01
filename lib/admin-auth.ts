import { auth, clerkClient } from '@clerk/nextjs/server';

export async function checkAdmin(): Promise<{ authorized: boolean; userId: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { authorized: false, userId: null };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;

  return { authorized: role === 'admin', userId };
}
