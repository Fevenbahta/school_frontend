import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString, unwrapTime } from '@/lib/api';
import AnimatedPage from '@/components/shared/AnimatedPage';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { GridCardSkeleton } from '@/components/shared/LoadingSkeleton';
import SearchFilter from '@/components/shared/SearchFilter';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ViolationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getViolations() || []); }
    catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(item => {
    if (!search) return true;
    const text = JSON.stringify(item).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <AnimatedPage>
      <PageHeader title="Violations" description="View exam violations reported by the system" />
      <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search violations..." />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <GridCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No violations" description="No violations have been recorded." />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((item: any, idx: number) => {
            const type = unwrapString(item.violation_type) || item.violation_type || item.type || 'Unknown';
            const studentName = unwrapString(item.student_name) || item.student_name || '';
            const examTitle = unwrapString(item.exam_title) || item.exam_title || '';
            const createdAt = unwrapTime(item.created_at) || item.created_at;

            return (
              <motion.div
                key={item.id || idx}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <div className="h-1.5 bg-destructive" />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="destructive" className="mb-1">{type}</Badge>
                      {studentName && <p className="text-sm font-medium text-foreground truncate">{studentName}</p>}
                      {examTitle && <p className="text-xs text-muted-foreground truncate">{examTitle}</p>}
                    </div>
                  </div>
                  {createdAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(createdAt), 'MMM d, yyyy · HH:mm')}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
