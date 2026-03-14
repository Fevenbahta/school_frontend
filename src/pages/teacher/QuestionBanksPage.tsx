import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import AnimatedPage from '@/components/shared/AnimatedPage';
import ViewToggle from '@/components/shared/ViewToggle';
import SearchFilter from '@/components/shared/SearchFilter';
import EmptyState from '@/components/shared/EmptyState';
import { GridCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, FileQuestion, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function QuestionBanksPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ subject_id: '', title: '' });
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => { api.getTeacherSubjects().then(setSubjects).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getQuestionBanks(page) || []); } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try { await api.createQuestionBank(form); toast.success('Created'); setDialogOpen(false); fetchData(); }
    catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const subjectMap = new Map(subjects.map(s => [s.subject_id, s.subject_name]));

  const filtered = data.filter(d => {
    if (!search) return true;
    const title = unwrapString(d.title)?.toLowerCase() || '';
    return title.includes(search.toLowerCase());
  });

  const columns: Column<any>[] = [
    { key: 'title', label: 'Title' },
    { key: 'subject_id', label: 'Subject', render: (item) => subjectMap.get(unwrapString(item.subject_id)) || unwrapString(item.subject_id) },
  ];

  const bankColors = ['bg-secondary/15', 'bg-accent', 'bg-warning/15', 'bg-success/15'];

  return (
    <AnimatedPage>
      <PageHeader title="Question Banks" description="Manage question banks" onAdd={() => { setForm({ subject_id: '', title: '' }); setDialogOpen(true); }} addLabel="Create Bank">
        <ViewToggle view={view} onChange={setView} />
      </PageHeader>
      <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search question banks..." />

      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <GridCardSkeleton key={i} />)}</div>
        ) : <TableSkeleton cols={2} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No question banks" description="Create your first question bank to start adding questions." />
      ) : view === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card rounded-xl p-5 group cursor-pointer"
              onClick={() => navigate(`/question-banks/${item.id}`)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl ${bankColors[i % bankColors.length]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <FileQuestion className="w-7 h-7 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground truncate">{unwrapString(item.title)}</h3>
                  <Badge variant="outline" className="mt-1.5 gap-1">
                    <BookOpen className="w-3 h-3" />
                    {subjectMap.get(unwrapString(item.subject_id)) || 'Subject'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Click to view questions</span>
                <Eye className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <DataTable columns={columns} data={filtered} isLoading={false} page={page} onPageChange={setPage}
          actions={(item) => (
            <Button variant="ghost" size="icon" onClick={() => navigate(`/question-banks/${item.id}`)}><Eye className="w-4 h-4" /></Button>
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Question Bank</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select subject..." /></SelectTrigger>
                <SelectContent>{subjects.map(s => (<SelectItem key={s.subject_id} value={s.subject_id}>{s.subject_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
