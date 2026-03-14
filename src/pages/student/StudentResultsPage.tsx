import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString, unwrapInt, unwrapTime } from '@/lib/api';
import AnimatedPage from '@/components/shared/AnimatedPage';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { GridCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Clock, CheckCircle2, Award, Star, TrendingUp, BarChart3, Calendar, Target, Sparkles, ArrowRight, Medal, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function StudentResultsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsData, examsData] = await Promise.all([
        api.getStudentSessions().catch(() => []),
        api.getStudentExams().catch(() => []),
      ]);
      setSessions(sessionsData || []);
      setExams(examsData || []);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completedSessions = (sessions || []).filter((s: any) => {
    const status = typeof s.status === 'object' ? unwrapString(s.status) : s.status;
    return status === 'submitted';
  });

  const getExamForSession = (session: any) => {
    const examId = typeof session.exam_id === 'object' ? unwrapString(session.exam_id) : session.exam_id;
    return (exams || []).find((e: any) => e.id === examId);
  };

  const getScore = (s: any) => typeof s.total_score === 'object' ? unwrapInt(s.total_score) : (s.total_score ?? 0);
  const getStartTime = (s: any) => typeof s.start_time === 'object' ? unwrapTime(s.start_time) : s.start_time;
  const getEndTime = (s: any) => typeof s.end_time === 'object' ? unwrapTime(s.end_time) : s.end_time;

  // Stats
  const totalExamsTaken = completedSessions.length;
  const totalScore = completedSessions.reduce((sum, s) => sum + getScore(s), 0);
  const avgScore = totalExamsTaken > 0 ? Math.round(totalScore / totalExamsTaken) : 0;
  const highestScore = totalExamsTaken > 0 ? Math.max(...completedSessions.map(getScore)) : 0;

  const viewDetail = async (session: any) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const result = await api.getSession(session.id);
      setSelectedSession({ ...session, detail: result });
    } catch (e: any) { toast.error(e.message); }
    setDetailLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '📚';
    return '💪';
  };

  const getTimeTaken = (session: any) => {
    const start = getStartTime(session);
    const end = getEndTime(session);
    if (!start || !end) return null;
    const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    return diff;
  };

  return (
    <AnimatedPage>
      <PageHeader title="My Results" description="Track your performance and celebrate your achievements" />

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {[
          { label: 'Exams Taken', value: totalExamsTaken, icon: Target, color: 'bg-primary/10 text-primary' },
          { label: 'Total Score', value: totalScore, icon: Star, color: 'bg-warning/10 text-warning' },
          { label: 'Average Score', value: avgScore, icon: TrendingUp, color: 'bg-success/10 text-success' },
          { label: 'Highest Score', value: highestScore, icon: Trophy, color: 'bg-primary/10 text-primary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Results List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <GridCardSkeleton key={i} />)}
        </div>
      ) : completedSessions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No results yet"
          description="Complete your first exam to see your results here. You've got this! 🎯"
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {completedSessions.map((session: any, idx: number) => {
            const exam = getExamForSession(session);
            const score = getScore(session);
            const startTime = getStartTime(session);
            const timeTaken = getTimeTaken(session);
            const examTitle = exam ? (unwrapString(exam.title) || exam.title) : 'Exam';
            const totalMarks = exam ? (unwrapInt(exam.total_marks) || exam.total_marks || 0) : 0;
            const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

            return (
              <motion.div
                key={session.id}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => viewDetail(session)}
              >
                {/* Top accent bar with gradient based on score */}
                <div className={`h-2 ${
                  pct >= 80 ? 'bg-gradient-to-r from-success to-primary' :
                  pct >= 50 ? 'bg-gradient-to-r from-warning to-primary' :
                  'bg-gradient-to-r from-destructive to-warning'
                }`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-foreground text-lg leading-tight truncate">{examTitle}</h3>
                      {startTime && (
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(startTime), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <motion.div
                      className="relative w-16 h-16 flex-shrink-0"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                    >
                      {/* Circular score indicator */}
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted) / 0.2)" strokeWidth="5" />
                        <circle
                          cx="32" cy="32" r="28" fill="none"
                          stroke={pct >= 80 ? 'hsl(var(--success))' : pct >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${(pct / 100) * 175.9} 175.9`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${getScoreColor(pct)}`}>{pct}%</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Score display */}
                  <div className="bg-muted/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-2xl font-heading font-bold text-foreground">
                          {score}<span className="text-sm text-muted-foreground font-normal">/{totalMarks || '?'}</span>
                        </p>
                      </div>
                      <span className="text-3xl">{getScoreEmoji(pct)}</span>
                    </div>
                    <Progress 
                      value={pct} 
                      className="h-2 mt-3" 
                    />
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {timeTaken !== null && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeTaken} min
                      </div>
                    )}
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Submitted
                    </Badge>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="w-full gap-2 text-primary hover:text-primary">
                      <BarChart3 className="w-3.5 h-3.5" /> View Details
                      <ArrowRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Exam Result Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedSession ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 py-2"
            >
              {/* Exam title */}
              {(() => {
                const exam = getExamForSession(selectedSession);
                const examTitle = exam ? (unwrapString(exam.title) || exam.title) : 'Exam';
                return (
                  <div className="text-center">
                    <h3 className="font-heading text-xl font-bold text-foreground">{examTitle}</h3>
                  </div>
                );
              })()}

              {/* Big score display */}
              {(() => {
                const score = getScore(selectedSession.detail || selectedSession);
                const exam = getExamForSession(selectedSession);
                const totalMarks = exam ? (unwrapInt(exam.total_marks) || exam.total_marks || 0) : 0;
                const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

                return (
                  <div className="text-center">
                    <motion.div
                      className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-4 ${
                        pct >= 80 ? 'bg-success/15' : pct >= 50 ? 'bg-warning/15' : 'bg-destructive/15'
                      }`}
                      initial={{ scale: 0.5, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div>
                        <p className={`text-4xl font-heading font-bold ${getScoreColor(pct)}`}>{score}</p>
                        <p className="text-xs text-muted-foreground">/ {totalMarks || '?'}</p>
                      </div>
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">{getScoreEmoji(pct)}</span>
                      <p className="font-heading text-lg font-semibold text-foreground">
                        {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : pct >= 40 ? 'Keep Trying!' : 'Don\'t Give Up!'}
                      </p>
                    </div>

                    <Progress value={pct} className="h-3 max-w-xs mx-auto rounded-full" />
                    <p className="text-sm text-muted-foreground mt-2">{pct}% score</p>
                  </div>
                );
              })()}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const detail = selectedSession.detail || selectedSession;
                  const startTime = typeof detail.start_time === 'object' ? unwrapTime(detail.start_time) : detail.start_time;
                  const endTime = typeof detail.end_time === 'object' ? unwrapTime(detail.end_time) : detail.end_time;
                  const status = typeof detail.status === 'object' ? unwrapString(detail.status) : detail.status;
                  const timeTaken = startTime && endTime
                    ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
                    : null;

                  return (
                    <>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                        <p className="text-lg font-bold text-foreground">{timeTaken !== null ? `${timeTaken} min` : '—'}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Time Taken</p>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1.5" />
                        <p className="text-lg font-bold text-foreground capitalize">{status}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                      </div>
                      {startTime && (
                        <div className="col-span-2 bg-muted/10 rounded-xl p-4 text-center">
                          <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(startTime), 'MMMM d, yyyy · h:mm a')}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Submitted On</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <Button className="w-full gap-2" onClick={() => setDetailOpen(false)}>
                <ArrowRight className="w-4 h-4" /> Back to Results
              </Button>
            </motion.div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
