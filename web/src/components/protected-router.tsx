import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuthContext } from '@/providers/Auth';


export default function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
 const { session, isLoading } = useAuthContext();
  const jwt = session?.accessToken || undefined;
  const user = session?.user || undefined;
  useEffect(() => {
    if (!session && !user) {
      router.push('/signin');
    }
  }, [user, session, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Verifying authentication...</div>
      </div>
    );
  }

  return user ? children : null;
}
