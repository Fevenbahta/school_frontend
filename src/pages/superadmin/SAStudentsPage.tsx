import { useState, useEffect, useCallback } from 'react';
import { api, unwrapString } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Upload, GraduationCap, Hash, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SAStudentsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ student_code: '', first_name: '', last_name: '', email: '', section_id: '' });
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  // Sections for the selected tenant
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => { api.getTenants(1, 100).then(setTenants).catch(() => {}); }, []);

  // Fetch sections when tenant changes using superadmin endpoint
  useEffect(() => {
    if (!tenantId) return;
    api.getSectionsSuperAdmin(tenantId, 1, 100).then(d => setSections(d || [])).catch(() => setSections([]));
  }, [tenantId]);

  const fetchStudents = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try { setData(await api.getStudentsSuperAdmin(tenantId, page) || []); }
    catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [tenantId, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.updateStudentSuperAdmin(editing.id, { id: editing.id, first_name: form.first_name, last_name: form.last_name });
        toast.success('Updated');
      } else {
        const payload: any = { tenant_id: tenantId, student_code: form.student_code, first_name: form.first_name, last_name: form.last_name, email: form.email };
        if (form.section_id) payload.section_id = form.section_id;
        const res = await api.createStudentSuperAdmin(payload);
        setCredentials({ username: res.username, password: res.password });
        toast.success('Created');
      }
      setDialogOpen(false); fetchStudents();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.deleteStudentSuperAdmin(deleteTarget); toast.success('Student deactivated'); setDeleteTarget(null); fetchStudents(); }
    catch (e: any) { toast.error(e.message); }
    setDeleting(false);
  };

  const [importing, setImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!tenantId) { toast.error('Please select a tenant first'); e.target.value = ''; return; }
    setImporting(true);
    try {
      await api.importStudentsSuperAdmin(tenantId, file);
      toast.success('Import successful');
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    }
    setImporting(false);
    e.target.value = '';
  };

  const filtered = data.filter(item => {
    const status = unwrapString(item.status) || item.status || 'active';
    if (status !== statusFilter) return false;
    if (!search) return true;
    const text = `${unwrapString(item.first_name)} ${unwrapString(item.last_name)} ${unwrapString(item.student_code)}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const columns: Column<any>[] = [
    { key: 'student_code', label: 'Code' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'status', label: 'Status' },
  ];

  const initials = (item: any) => ((unwrapString(item.first_name)?.[0] || '') + (unwrapString(item.last_name)?.[0] || '')).toUpperCase();

  const activeCount = data.filter(i => (unwrapString(i.status) || i.status || 'active') === 'active').length;
  const inactiveCount = data.filter(i => (unwrapString(i.status) || i.status) === 'inactive').length;

  return (
    <AnimatedPage>
      <PageHeader title="Students" description="Manage students across tenants" onAdd={tenantId ? () => { setEditing(null); setForm({ student_code: '', first_name: '', last_name: '', email: '', section_id: '' }); setDialogOpen(true); } : undefined} addLabel="Add Student">
        <label className="cursor-pointer">
          <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={importing} />
          <Button variant="outline" asChild disabled={importing}>
            <span className="gap-2 flex items-center">
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Import CSV'}
              {!tenantId && <Badge variant="secondary" className="text-xs ml-1">Select tenant first</Badge>}
            </span>
          </Button>
        </label>
        <ViewToggle view={view} onChange={setView} />
      </PageHeader>

      <div className="mb-6 max-w-md">
        <Label>Select Tenant</Label>
        <Select value={tenantId} onValueChange={v => { setTenantId(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Choose a tenant..." /></SelectTrigger>
          <SelectContent>{tenants.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>

      {/* Active / Inactive toggle - side by side */}
      {tenantId && (
        <div className="flex items-center gap-1 mb-4 bg-muted/10 p-1 rounded-xl w-fit">
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'active'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'inactive'
                ? 'bg-destructive text-destructive-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      )}

      {tenantId && <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search students..." />}

      {!tenantId ? (
        <EmptyState icon={GraduationCap} title="Select a tenant" description="Choose a tenant above to view and manage students." />
      ) : loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{[1,2,3,4].map(i => <GridCardSkeleton key={i} />)}</div>
        ) : <TableSkeleton cols={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title={`No ${statusFilter} students found`} description={statusFilter === 'active' ? 'Add students or import from CSV.' : 'No inactive students.'} />
      ) : view === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map(item => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-xl p-5 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-sm font-heading font-bold text-accent-foreground">{initials(item)}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-foreground truncate">{unwrapString(item.first_name)} {unwrapString(item.last_name)}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash className="w-3 h-3" />
                    {unwrapString(item.student_code)}
                  </div>
                </div>
              </div>
              <Badge variant={(unwrapString(item.status) || item.status) === 'active' ? 'default' : 'secondary'} className="mb-3">
                {unwrapString(item.status) || item.status}
              </Badge>
              <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setForm({ student_code: unwrapString(item.student_code), first_name: unwrapString(item.first_name), last_name: unwrapString(item.last_name), email: '', section_id: '' }); setDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                {statusFilter === 'active' && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <DataTable columns={columns} data={filtered} isLoading={false} page={page} onPageChange={setPage}
          actions={(item) => (
            <div className="flex items-center gap-1 justify-end">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setForm({ student_code: unwrapString(item.student_code), first_name: unwrapString(item.first_name), last_name: unwrapString(item.last_name), email: '', section_id: '' }); setDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
              {statusFilter === 'active' && (
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              )}
            </div>
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {!editing && <div className="space-y-2"><Label>Student Code</Label><Input value={form.student_code} onChange={e => setForm(f => ({ ...f, student_code: e.target.value }))} /></div>}
            <div className="space-y-2"><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
            {!editing && (
              <>
                <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Section <span className="text-destructive">*</span></Label>
                  <Select value={form.section_id} onValueChange={v => setForm(f => ({ ...f, section_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select section..." /></SelectTrigger>
                    <SelectContent>
                      {sections.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} {unwrapString(s.grade_level) ? `(Grade ${unwrapString(s.grade_level)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credentials} onOpenChange={() => setCredentials(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Student Credentials</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Save these credentials. They won't be shown again.</p>
          <div className="space-y-3 bg-accent/50 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-muted-foreground">Username:</span> {credentials?.username}</div>
            <div><span className="text-muted-foreground">Password:</span> {credentials?.password}</div>
          </div>
          <Button onClick={() => setCredentials(null)} className="w-full mt-2">Done</Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Deactivate Student" description="This will deactivate the student. They can be reactivated later." />
    </AnimatedPage>
  );
}
