import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import AnimatedPage from '@/components/shared/AnimatedPage';
import ViewToggle from '@/components/shared/ViewToggle';
import SearchFilter from '@/components/shared/SearchFilter';
import EmptyState from '@/components/shared/EmptyState';
import { GridCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, UserCog, Plus, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const avatarColors = [
  'bg-primary/15 text-primary',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning',
  'bg-destructive/15 text-destructive',
  'bg-accent text-accent-foreground',
  'bg-secondary/15 text-secondary',
];

export default function TeachersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', teacher_code: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getTeachers(page) || []); } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await api.updateTeacher({ id: editing.id, first_name: form.first_name, last_name: form.last_name }); toast.success('Updated'); }
      else {
        const payload: any = { first_name: form.first_name, last_name: form.last_name, email: form.email };
        if (form.teacher_code.trim()) payload.teacher_code = form.teacher_code.trim();
        const res = await api.createTeacher(payload);
        setCredentials({ username: res.username, password: res.password });
        toast.success('Created');
      }
      setDialogOpen(false); fetchData();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.deleteTeacher(deleteTarget); toast.success('Deleted'); setDeleteTarget(null); fetchData(); }
    catch (e: any) { toast.error(e.message); }
    setDeleting(false);
  };

  const filtered = data.filter(item => {
    if (!search) return true;
    const name = `${unwrapString(item.first_name)} ${unwrapString(item.last_name)}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const columns: Column<any>[] = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
  ];

  const initials = (item: any) => {
    const f = unwrapString(item.first_name)?.[0] || '';
    const l = unwrapString(item.last_name)?.[0] || '';
    return (f + l).toUpperCase();
  };

  return (
    <AnimatedPage>
      {/* People directory header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center">
              <Users className="w-7 h-7 text-secondary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center text-[10px] font-bold text-success-foreground border-2 border-card">
              {data.length}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground">Faculty directory · {data.length} member{data.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <Button onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', email: '', teacher_code: '' }); setDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        </div>
      </div>

      <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search by name..." />

      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{[1,2,3,4].map(i => <GridCardSkeleton key={i} />)}</div>
        ) : <TableSkeleton cols={2} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserCog} title="No teachers found" description="Add your first teacher to get started." />
      ) : view === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-xl overflow-hidden group"
            >
              {/* Horizontal card layout - people directory style */}
              <div className="flex items-center gap-4 p-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-14 h-14 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-lg font-heading font-bold">{initials(item)}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground truncate">
                    {unwrapString(item.first_name)} {unwrapString(item.last_name)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Faculty Member</p>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(item); setForm({ first_name: unwrapString(item.first_name), last_name: unwrapString(item.last_name), email: '', teacher_code: '' }); setDialogOpen(true); }}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(item.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <DataTable columns={columns} data={filtered} isLoading={false} page={page} onPageChange={setPage}
          actions={(item) => (
            <div className="flex items-center gap-1 justify-end">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setForm({ first_name: unwrapString(item.first_name), last_name: unwrapString(item.last_name), email: '', teacher_code: '' }); setDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
            {!editing && <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>}
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!credentials} onOpenChange={() => setCredentials(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Teacher Credentials</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Save these credentials — they won't be shown again.</p>
          <div className="space-y-3 bg-accent/50 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-muted-foreground">Username:</span> {credentials?.username}</div>
            <div><span className="text-muted-foreground">Password:</span> {credentials?.password}</div>
          </div>
          <Button onClick={() => setCredentials(null)} className="w-full mt-2">Done</Button>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
    </AnimatedPage>
  );
}
