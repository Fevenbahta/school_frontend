import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Building2, Layers,
  ClipboardList, FileText, Award, Settings, LogOut, Moon, Sun,
  Menu, X, ChevronDown, School, UserCog, BookMarked, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const getNavItems = (role: string | null): NavItem[] => {
  switch (role) {
    case 'super_admin':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Tenants', href: '/tenants', icon: Building2 },
        { label: 'Students', href: '/students', icon: GraduationCap },
        { label: 'Reports', href: '/reports', icon: BarChart3 },
      ];
    case 'school_admin':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Teachers', href: '/teachers', icon: UserCog },
        { label: 'Departments', href: '/departments', icon: Building2 },
        { label: 'Sections', href: '/sections', icon: Layers },
        { label: 'Subjects', href: '/subjects', icon: BookOpen },
        { label: 'Assignments', href: '/assignments', icon: ClipboardList },
        { label: 'Exams', href: '/exams', icon: FileText },
        { label: 'Results', href: '/results', icon: Award },
      ];
    case 'teacher':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Subjects', href: '/subjects', icon: BookOpen },
        { label: 'My Students', href: '/students', icon: GraduationCap },
        { label: 'Exams', href: '/exams', icon: FileText },
        { label: 'Results', href: '/results', icon: Award },
      ];
    case 'student':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Exams', href: '/exams', icon: FileText },
        { label: 'Mock Exams', href: '/mock-exams', icon: BookMarked },
        { label: 'My Results', href: '/results', icon: Award },
        { label: 'Progress', href: '/progress', icon: BarChart3 },
      ];
    default:
      return [];
  }
};

const getRoleLabel = (role: string | null) => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'school_admin': return 'School Admin';
    case 'teacher': return 'Teacher';
    case 'student': return 'Student';
    default: return 'User';
  }
};

const getRoleColor = (role: string | null) => {
  switch (role) {
    case 'super_admin': return 'bg-destructive/10 text-destructive';
    case 'school_admin': return 'bg-success/10 text-success';
    case 'teacher': return 'bg-info/10 text-info';
    case 'student': return 'bg-accent text-accent-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <School className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <span className="font-display font-bold text-sidebar-foreground text-lg leading-tight">ExamPro</span>
              <span className="text-xs text-muted-foreground">Management System</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Role Badge */}
      {sidebarOpen && (
        <div className="px-6 py-3">
          <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", getRoleColor(role))}>
            {getRoleLabel(role)}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {isActive && sidebarOpen && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent w-full transition-all duration-300"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {sidebarOpen && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border fixed h-screen z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[80px]")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) setMobileOpen(!mobileOpen);
                  else setSidebarOpen(!sidebarOpen);
                }}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Home</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground rotate-[-90deg]" />
                <span className="font-medium capitalize">
                  {location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{user?.uid === 'superadmin' ? 'Super Admin' : 'Admin User'}</span>
                <span className="text-xs text-muted-foreground">{getRoleLabel(role)}</span>
              </div>
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {user?.uid === 'superadmin' ? 'SA' : 'AU'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
