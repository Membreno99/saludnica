// Guard de suscripción: redirige a /subscribe si el usuario no tiene suscripción activa
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function SubscriptionGuard({ children }: Props) {
  const { user, loading, isSubscribed } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // No autenticado → login
  if (!user) return <Navigate to="/login" replace />;

  // Sin suscripción activa → paywall
  if (!isSubscribed) return <Navigate to="/subscribe" replace />;

  return <>{children}</>;
}
