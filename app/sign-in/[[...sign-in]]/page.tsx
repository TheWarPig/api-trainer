import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center bg-[var(--color-bg-deepest)]" style={{ minHeight: 'calc(100vh / 1.25)' }}>
      <SignIn />
    </div>
  );
}
