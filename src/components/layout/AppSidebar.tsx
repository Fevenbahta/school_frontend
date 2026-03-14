import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { api } from '@/lib/api';
import {
  Building2, Users, GraduationCap, BookOpen, Layers, UserCog,
  LayoutDashboard, LogOut, Sun, Moon, ClipboardList, FileQuestion, School, ShieldAlert, KeyRound, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navByRole: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Tenants', icon: Building2, path: '/tenants' },
    { label: 'Students', icon: GraduationCap, path: '/sa-students' },
  ],
  school_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Departments', icon: Layers, path: '/departments' },
    { label: 'Sections', icon: BookOpen, path: '/sections' },
    { label: 'Subjects', icon: ClipboardList, path: '/subjects' },
    { label: 'Teachers', icon: UserCog, path: '/teachers' },
    { label: 'Assignments', icon: School, path: '/assignments' },
    { label: 'Violations', icon: ShieldAlert, path: '/violations' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Question Banks', icon: FileQuestion, path: '/question-banks' },
    { label: 'Exams', icon: ClipboardList, path: '/exams' },
    { label: 'Students', icon: GraduationCap, path: '/t-students' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Exams', icon: ClipboardList, path: '/my-exams' },
    { label: 'My Results', icon: Trophy, path: '/my-results' },
  ],
};

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [pwOpen, setPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  if (!user) return null;

  const items = navByRole[user.role] || [];

  const handleChangePassword = async () => {
    if (!oldPw || !newPw) { toast.error('Please fill both fields'); return; }
    setChangingPw(true);
    try {
      await api.changePassword(oldPw, newPw);
      toast.success('Password changed successfully');
      setPwOpen(false);
      setOldPw('');
      setNewPw('');
    } catch (e: any) { toast.error(e.message || 'Failed to change password'); }
    setChangingPw(false);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col sidebar-glow z-50">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-sidebar-primary">ExamPrep</h1>
              <p className="text-xs text-sidebar-muted capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => setPwOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
          >
            <KeyRound className="w-4.5 h-4.5" />
            Change Password
          </button>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-sidebar-accent/50 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Enter new password" />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPw} className="w-full">
              {changingPw ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
