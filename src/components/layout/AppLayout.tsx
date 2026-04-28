import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import SchoolBanner from './SchoolBanner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-8 animate-fade-in">
        <SchoolBanner />
        <Outlet />
      </main>
    </div>
  );
}
