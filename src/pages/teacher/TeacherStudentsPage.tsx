import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString, unwrapInt } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import AnimatedPage from '@/components/shared/AnimatedPage';
import ViewToggle from '@/components/shared/ViewToggle';
import SearchFilter from '@/components/shared/SearchFilter';
import EmptyState from '@/components/shared/EmptyState';
import { GridCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Mail, Hash, BookOpen, Users, Trophy, ChevronDown, ChevronUp, FileText, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentMark {
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
}

export default function TeacherStudentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [studentMarks, setStudentMarks] = useState<Record<string, StudentMark[]>>({});
  const [marksLoading, setMarksLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getTeacherStudents(page) || []); }
    catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [page]);

  // Fetch all exam marks to map per student
  const fetchMarks = useCallback(async () => {
    setMarksLoading(true);
    try {
      const exams = await api.getExams(1, 100) || [];
      const marksMap: Record<string, StudentMark[]> = {};

      await Promise.all(exams.map(async (exam: any) => {
        try {
          const result = await api.getExamMarks(exam.id);
          const examTitle = unwrapString(result?.exam_title) || result?.exam_title || unwrapString(exam.title) || exam.title || 'Exam';
          const totalMarks = unwrapInt(exam.total_marks) || exam.total_marks || 0;
          const marks = result?.marks || [];
          if (Array.isArray(marks)) {
            marks.forEach((m: any) => {
              const sid = m.student_id || unwrapString(m.student_id) || '';
              if (!sid) return;
              if (!marksMap[sid]) marksMap[sid] = [];
              marksMap[sid].push({
                examId: exam.id,
                examTitle: typeof examTitle === 'string' ? examTitle : String(examTitle),
                score: m.total_score ?? m.score ?? 0,
                totalMarks: typeof totalMarks === 'number' ? totalMarks : Number(totalMarks) || 0,
              });
            });
          }
        } catch { /* skip exam if marks fail */ }
      }));

      setStudentMarks(marksMap);
    } catch { /* silent */ }
    setMarksLoading(false);
  }, []);

  useEffect(() => { fetchData(); fetchMarks(); }, [fetchData, fetchMarks]);

  const filtered = data.filter(item => {
    if (!search) return true;
    const firstName = unwrapString(item.first_name) || item.first_name || '';
    const lastName = unwrapString(item.last_name) || item.last_name || '';
    const code = unwrapString(item.student_code) || item.student_code || '';
    const email = unwrapString(item.email) || item.email || '';
    const q = search.toLowerCase();
    return firstName.toLowerCase().includes(q) || lastName.toLowerCase().includes(q) || code.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const sectionGroups = filtered.reduce((acc: Record<string, any[]>, item) => {
    const section = unwrapString(item.section_name) || item.section_name || 'Unassigned';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const getStudentId = (item: any) => item.id || item.student_id || '';

  const getStudentAvg = (sid: string) => {
    const marks = studentMarks[sid];
    if (!marks || marks.length === 0) return null;
    const totalScore = marks.reduce((s, m) => s + m.score, 0);
    const totalMax = marks.reduce((s, m) => s + m.totalMarks, 0);
    if (totalMax === 0) return null;
    return Math.round((totalScore / totalMax) * 100);
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600 bg-green-500/10';
    if (pct >= 60) return 'text-blue-600 bg-blue-500/10';
    if (pct >= 40) return 'text-yellow-600 bg-yellow-500/10';
    return 'text-red-600 bg-red-500/10';
  };

  const columns: Column<any>[] = [
    { key: 'student_code', label: 'Code', render: (item) => unwrapString(item.student_code) || item.student_code || '—' },
    { key: 'first_name', label: 'First Name', render: (item) => unwrapString(item.first_name) || item.first_name || '—' },
    { key: 'last_name', label: 'Last Name', render: (item) => unwrapString(item.last_name) || item.last_name || '—' },
    { key: 'email', label: 'Email', render: (item) => unwrapString(item.email) || item.email || '—' },
    { key: 'section_name', label: 'Section', render: (item) => <Badge variant="secondary">{unwrapString(item.section_name) || item.section_name || '—'}</Badge> },
    {
      key: 'results', label: 'Avg Score', render: (item) => {
        const sid = getStudentId(item);
        const avg = getStudentAvg(sid);
        if (avg === null) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <Badge className={getScoreColor(avg)}>
            <Trophy className="w-3 h-3 mr-1" />{avg}%
          </Badge>
        );
      }
    },
  ];

  return (
    <AnimatedPage>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-card">
              {data.length}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">My Students</h1>
            <p className="text-muted-foreground">
              {data.length} student{data.length !== 1 ? 's' : ''} across {Object.keys(sectionGroups).length} section{Object.keys(sectionGroups).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search by name, code, or email..." />

      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <GridCardSkeleton key={i} />)}</div>
        ) : <TableSkeleton cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students" description="No students found in your sections." />
      ) : view === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(sectionGroups).map(([section, students], gi) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent">
                  <BookOpen className="w-4 h-4 text-accent-foreground" />
                  <span className="text-sm font-semibold text-accent-foreground">{section}</span>
                </div>
                <div className="flex-1 h-px bg-border/50" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {(students as any[]).length} student{(students as any[]).length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(students as any[]).map((item: any, i: number) => {
                  const firstName = unwrapString(item.first_name) || item.first_name || '';
                  const lastName = unwrapString(item.last_name) || item.last_name || '';
                  const code = unwrapString(item.student_code) || item.student_code || '';
                  const email = unwrapString(item.email) || item.email || '';
                  const init = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase();
                  const sid = getStudentId(item);
                  const avg = getStudentAvg(sid);
                  const marks = studentMarks[sid] || [];
                  const isExpanded = expandedStudent === sid;

                  return (
                    <motion.div
                      key={sid || code}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-xl bg-card border border-border/30 hover:border-primary/20 transition-colors overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => setExpandedStudent(isExpanded ? null : sid)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{init}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{firstName} {lastName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {code && <span className="flex items-center gap-0.5"><Hash className="w-3 h-3" />{code}</span>}
                            {email && <span className="flex items-center gap-0.5 truncate"><Mail className="w-3 h-3" />{email}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {avg !== null && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(avg)}`}>
                              {avg}%
                            </span>
                          )}
                          {marks.length > 0 && (
                            isExpanded
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && marks.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-border/30">
                              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground">
                                <FileText className="w-3.5 h-3.5" />
                                Exam Results
                              </div>
                              <div className="space-y-1.5">
                                {marks.map((m, mi) => {
                                  const pct = m.totalMarks > 0 ? Math.round((m.score / m.totalMarks) * 100) : 0;
                                  return (
                                    <div key={mi} className="flex items-center justify-between text-xs">
                                      <span className="text-foreground truncate flex-1 mr-2">{m.examTitle}</span>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-muted-foreground">{m.score}/{m.totalMarks}</span>
                                        <span className={`font-bold px-1.5 py-0.5 rounded ${getScoreColor(pct)}`}>
                                          {pct}%
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isExpanded && marks.length === 0 && !marksLoading && (
                        <div className="px-3 pb-2">
                          <span className="text-[10px] text-muted-foreground/60 italic"></span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} isLoading={false} page={page} onPageChange={setPage} />
      )}
    </AnimatedPage>
  );
}
