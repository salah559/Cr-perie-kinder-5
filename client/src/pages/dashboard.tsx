import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import OwnerDashboard from './dashboards/owner-dashboard';
import LivreurDashboard from './dashboards/livreur-dashboard';
import ClientDashboard from './dashboards/client-dashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role === 'owner') {
    return <OwnerDashboard />;
  }

  if (user.role === 'livreur') {
    return <LivreurDashboard />;
  }

  return <ClientDashboard />;
}
