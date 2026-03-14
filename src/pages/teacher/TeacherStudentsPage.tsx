import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import AnimatedPage from '@/components/shared/AnimatedPage';
import ViewToggle from '@/components/shared/ViewToggle';
import SearchFilter from '@/components/shared/SearchFilter';
import EmptyState from '@/components/shared/EmptyState';
import { GridCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TeacherStudentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getTeacherStudents(page) || []);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(item => {
    if (!search) return true;
    const firstName = unwrapString(item.first_name) || item.first_name || '';
    const lastName = unwrapString(item.last_name) || item.last_name || '';
    const code = unwrapString(item.student_code) || item.student_code || '';
    const email = unwrapString(item.email) || item.email || '';
    const q = search.toLowerCase();
    return firstName.toLowerCase().includes(q) || lastName.toLowerCase().includes(q) || code.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const columns: Column<any>[] = [
    { key: 'student_code', label: 'Code', render: (item) => unwrapString(item.student_code) || item.student_code || '—' },
    { key: 'first_name', label: 'First Name', render: (item) => unwrapString(item.first_name) || item.first_name || '—' },
    { key: 'last_name', label: 'Last Name', render: (item) => unwrapString(item.last_name) || item.last_name || '—' },
    { key: 'email', label: 'Email', render: (item) => unwrapString(item.email) || item.email || '—' },
    { key: 'section_name', label: 'Section', render: (item) => <Badge variant="secondary">{unwrapString(item.section_name) || item.section_name || '—'}</Badge> },
  ];

  return (
    <AnimatedPage>
      <PageHeader title="My Students" description="Students in your assigned sections">
        <ViewToggle view={view} onChange={setView} />
      </PageHeader>
      <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search students..." />

      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <GridCardSkeleton key={i} />)}
          </div>
        ) : <TableSkeleton cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students" description="No students found in your sections." />
      ) : view === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((item) => {
            const firstName = unwrapString(item.first_name) || item.first_name || '';
            const lastName = unwrapString(item.last_name) || item.last_name || '';
            const code = unwrapString(item.student_code) || item.student_code || '';
            const email = unwrapString(item.email) || item.email || '';
            const section = unwrapString(item.section_name) || item.section_name || '';
            return (
              <motion.div
                key={item.id || item.student_id || code}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold truncate">{firstName} {lastName}</p>
                    <p className="text-sm text-muted-foreground truncate">{email || '—'}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{code || '—'}</Badge>
                      {section && <Badge variant="secondary">{section}</Badge>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <DataTable columns={columns} data={filtered} isLoading={false} page={page} onPageChange={setPage} />
      )}
    </AnimatedPage>
  );
}
