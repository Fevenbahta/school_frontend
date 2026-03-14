import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api, unwrapString, unwrapInt, unwrapTime } from '@/lib/api';
import StatCard from '@/components/shared/StatCard';
import AnimatedPage from '@/components/shared/AnimatedPage';
import PageHeader from '@/components/shared/PageHeader';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Building2, Users, GraduationCap, BookOpen, Layers, ClipboardList, FileQuestion, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const roleLabels = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
};

const chartColors = [
  'hsl(180, 20%, 29%)',
  'hsl(145, 38%, 70%)',
  'hsl(90, 6%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(168, 22%, 12%)',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      if (user!.role === 'super_admin') {
        const tenants = await api.getTenants(1, 100).catch(() => []);
        const activeTenants = (tenants || []).filter((t: any) => unwrapString(t.status) === 'active');
        setStats({
          totalTenants: (tenants || []).length,
          activeTenants: activeTenants.length,
          inactiveTenants: (tenants || []).length - activeTenants.length,
          tenants: tenants || [],
        });
      } else if (user!.role === 'school_admin') {
        const [deps, secs, subs, teachers, assignments] = await Promise.all([
          api.getDepartments(1, 100).catch(() => []),
          api.getSections(1, 100).catch(() => []),
          api.getSubjects(1, 100).catch(() => []),
          api.getTeachers(1, 100).catch(() => []),
          api.getAssignments().catch(() => []),
        ]);
        setStats({
          departments: (deps || []).length,
          sections: (secs || []).length,
          subjects: (subs || []).length,
          teachers: (teachers || []).length,
          assignments: (assignments || []).length,
          depList: deps || [],
          teacherList: teachers || [],
          assignmentList: assignments || [],
        });
      } else if (user!.role === 'student') {
        const [exams, sessions] = await Promise.all([
          api.getStudentExams().catch(() => []),
          api.getStudentSessions().catch(() => []),
        ]);
        const published = (exams || []).filter((e: any) => (unwrapString(e.status) || e.status) === 'published');
        const completed = (sessions || []).filter((s: any) => (unwrapString(s.status) || s.status) === 'submitted');
        const totalScore = completed.reduce((sum: number, s: any) => sum + (unwrapInt(s.total_score) || 0), 0);
        setStats({
          availableExams: published.length,
          completedSessions: completed.length,
          totalScore,
        });
      } else if (user!.role === 'teacher') {
        const [qbs, exams] = await Promise.all([
          api.getQuestionBanks(1, 100).catch(() => []),
          api.getExams(1, 100).catch(() => []),
        ]);
        const published = (exams || []).filter((e: any) => unwrapString(e.status) === 'published');
        const draft = (exams || []).filter((e: any) => unwrapString(e.status) === 'draft');
        setStats({
          questionBanks: (qbs || []).length,
          totalExams: (exams || []).length,
          publishedExams: published.length,
          draftExams: draft.length,
          exams: exams || [],
          qbs: qbs || [],
        });
      }
    } catch (e) {}
    setLoading(false);
  };

  if (!user) return null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AnimatedPage>
      <PageHeader title={`${roleLabels[user.role]} Dashboard`} description="Overview of your platform activity" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

          {/* Super Admin Dashboard */}
          {user.role === 'super_admin' && <>
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Tenants" value={stats.totalTenants || 0} icon={Building2} description="Schools registered" />
              <StatCard title="Active Schools" value={stats.activeTenants || 0} icon={CheckCircle2} description="Currently active" />
              <StatCard title="Inactive Schools" value={stats.inactiveTenants || 0} icon={Clock} description="Deactivated" />
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Tenant Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: stats.activeTenants || 0 },
                          { name: 'Inactive', value: stats.inactiveTenants || 0 },
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={5} dataKey="value"
                      >
                        {[chartColors[0], chartColors[2]].map((c, i) => (
                          <Cell key={i} fill={c} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Tenants */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Recent Tenants</h3>
                <div className="space-y-3">
                  {(stats.tenants || []).slice(0, 5).map((t: any, i: number) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{unwrapString(t.address)}</p>
                        </div>
                      </div>
                      <Badge variant={unwrapString(t.status) === 'active' ? 'default' : 'secondary'}>
                        {unwrapString(t.status)}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>}

          {/* School Admin Dashboard */}
          {user.role === 'school_admin' && <>
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Departments" value={stats.departments || 0} icon={Layers} />
              <StatCard title="Sections" value={stats.sections || 0} icon={BookOpen} />
              <StatCard title="Subjects" value={stats.subjects || 0} icon={ClipboardList} />
              <StatCard title="Teachers" value={stats.teachers || 0} icon={Users} />
              <StatCard title="Assignments" value={stats.assignments || 0} icon={TrendingUp} />
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Distribution */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Resource Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Depts', count: stats.departments || 0 },
                      { name: 'Sections', count: stats.sections || 0 },
                      { name: 'Subjects', count: stats.subjects || 0 },
                      { name: 'Teachers', count: stats.teachers || 0 },
                    ]}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(168, 10%, 35%)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(168, 10%, 35%)' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={chartColors[0]} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Assignments */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Recent Assignments</h3>
                <div className="space-y-3">
                  {(stats.assignmentList || []).slice(0, 6).map((a: any, i: number) => (
                    <motion.div
                      key={a.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {unwrapString(a.first_name)} {unwrapString(a.last_name)}
                          </p>
                          <p className="text-xs text-muted-foreground">{a.subject_name} · {a.section_name}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(stats.assignmentList || []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No assignments yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>}

          {/* Teacher Dashboard */}
          {user.role === 'teacher' && <>
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Question Banks" value={stats.questionBanks || 0} icon={FileQuestion} />
              <StatCard title="Total Exams" value={stats.totalExams || 0} icon={ClipboardList} />
              <StatCard title="Published" value={stats.publishedExams || 0} icon={CheckCircle2} description="Live exams" />
              <StatCard title="Drafts" value={stats.draftExams || 0} icon={Clock} description="In progress" />
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exam Status Pie */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Exam Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Published', value: stats.publishedExams || 0 },
                          { name: 'Draft', value: stats.draftExams || 0 },
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={5} dataKey="value"
                      >
                        <Cell fill={chartColors[1]} />
                        <Cell fill={chartColors[2]} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Exams */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Recent Exams</h3>
                <div className="space-y-3">
                  {(stats.exams || []).slice(0, 5).map((exam: any, i: number) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{unwrapString(exam.title)}</p>
                          <p className="text-xs text-muted-foreground">{unwrapInt(exam.duration_minutes)} min · {unwrapInt(exam.total_marks)} marks</p>
                        </div>
                      </div>
                      <Badge variant={unwrapString(exam.status) === 'published' ? 'default' : 'secondary'}>
                        {unwrapString(exam.status)}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>}

          {/* Student Dashboard */}
          {user.role === 'student' && (
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Available Exams" value={stats.availableExams ?? '—'} icon={ClipboardList} description="Ready to take" />
              <StatCard title="Completed Exams" value={stats.completedSessions ?? '—'} icon={GraduationCap} description="Finished exams" />
              <StatCard title="Total Score" value={stats.totalScore ?? '—'} icon={TrendingUp} description="Points earned" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
