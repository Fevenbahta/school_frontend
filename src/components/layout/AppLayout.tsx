import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api, unwrapString } from '@/lib/api';
import AppSidebar from './AppSidebar';
import { Building2 } from 'lucide-react';

export default function AppLayout() {
  const { user } = useAuth();
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.role === 'teacher') {
      // Get school name from assignments (tenant context)
      api.getMyAssignments().then(assignments => {
        if (assignments?.length > 0) {
          // We don't have school name in assignments, but we show the teacher's name context
        }
      }).catch(() => {});
    }
    // For school_admin, try fetching tenant info via the super admin endpoint if tid is available
    if (user.tid && user.role === 'super_admin') {
      api.getTenant(user.tid).then((t: any) => {
        setSchoolName(t?.name || unwrapString(t?.name) || '');
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
