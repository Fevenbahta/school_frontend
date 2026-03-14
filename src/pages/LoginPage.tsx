import { useState } from 'react';
import studentsExamImg from '@/components/assets/students-exam.png';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, Eye, EyeOff, BookOpen, PenTool, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const floatingIcons = [
  { Icon: BookOpen, x: '15%', y: '20%', delay: 0, size: 28 },
  { Icon: PenTool, x: '75%', y: '30%', delay: 1.2, size: 22 },
  { Icon: BarChart3, x: '25%', y: '70%', delay: 0.6, size: 26 },
  { Icon: GraduationCap, x: '70%', y: '75%', delay: 1.8, size: 30 },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left/Top decorative panel */}
      <div className="w-full lg:w-1/2 bg-primary relative overflow-hidden flex items-center justify-center py-10 lg:py-0 min-h-[280px] lg:min-h-screen">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary"
          animate={{
            background: [
              'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
              'linear-gradient(225deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
              'linear-gradient(315deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
              'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating icons */}
        {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
          <motion.div
            key={i}
            className="absolute text-accent/20 hidden lg:block"
            style={{ left: x, top: y }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon style={{ width: size, height: size }} />
          </motion.div>
        ))}

        {/* Animated circles */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 border border-accent/10 rounded-full hidden lg:block"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-32 left-16 w-48 h-48 border border-accent/5 rounded-full hidden lg:block"
          animate={{ scale: [1, 1.15, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-6 lg:px-12 flex flex-col items-center"
        >
          <motion.img
            src={studentsExamImg}
            alt="Students taking an exam"
            className="w-[260px] lg:w-[420px] max-w-full mb-4 lg:mb-8 drop-shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-2xl lg:text-4xl font-heading font-bold text-primary-foreground mb-2 lg:mb-4">ExamPrep</h2>
          <p className="text-primary-foreground/70 text-sm lg:text-lg max-w-md hidden sm:block">
            A comprehensive exam preparation platform for schools, universities, and training institutions.
          </p>
          <div className="mt-4 lg:mt-8 flex flex-wrap justify-center gap-2 lg:gap-3 hidden sm:flex">
            {['Question Banks', 'Timed Exams', 'Analytics', 'Multi-Tenant'].map((label, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-accent/10 text-accent text-xs lg:text-sm font-medium border border-accent/15"
              >
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right/Bottom login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-heading font-bold text-foreground mb-2"
          >
            Welcome back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mb-8"
          >
            Sign in to your account to continue
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
