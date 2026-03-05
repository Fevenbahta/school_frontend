import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Upload, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tenantsApi, superStudentsApi, nv } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { superAdminNavItems } from "./navItems";

const SuperAdminStudentsPage = () => {
  const [tenantId, setTenantId] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", student_code: "", first_name: "", last_name: "", email: "" });

  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: tenantsData } = useQuery({ queryKey: ["tenants", 1], queryFn: () => tenantsApi.list(1, 100) });
  const tenants = tenantsData?.data?.data ?? tenantsData?.data ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["super-students", tenantId, page],
    queryFn: () => superStudentsApi.list(tenantId, page, 20),
    enabled: !!tenantId,
  });
  const students = data?.data?.data ?? data?.data ?? [];

  const createMut = useMutation({ mutationFn: superStudentsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ["super-students"] }); setCreateOpen(false); toast({ title: "Student Created" }); }});
  const deleteMut = useMutation({ mutationFn: superStudentsApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ["super-students"] }); toast({ title: "Student Deleted" }); }});
  const importMut = useMutation({
    mutationFn: (file: File) => superStudentsApi.import(tenantId, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["super-students"] }); toast({ title: "Students Imported" }); },
  });

  return (
    <DashboardLayout navItems={superAdminNavItems} title="Manage Students">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <select value={tenantId} onChange={e => { setTenantId(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm">
          <option value="">Select Tenant</option>
          {Array.isArray(tenants) && tenants.map((t: any) => <option key={t.id} value={t.id}>{nv(t.name)}</option>)}
        </select>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && tenantId) importMut.mutate(f); }} />
            <Button variant="outline" className="gap-2" asChild><span><Upload className="w-4 h-4" /> Import CSV</span></Button>
          </label>
          <Button onClick={() => { setForm({ ...form, tenant_id: tenantId }); setCreateOpen(true); }} disabled={!tenantId} className="gap-2">
            <UserPlus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {!tenantId ? <EmptyState title="Select a tenant" description="Choose a tenant to view students." /> : (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          {isLoading ? <div className="p-6"><TableSkeleton /></div> : !Array.isArray(students) || students.length === 0 ? <EmptyState title="No students" description="Add students to this tenant." /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {students.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{nv(s.student_code)}</TableCell>
                    <TableCell className="font-medium">{nv(s.first_name)} {nv(s.last_name)}</TableCell>
                    <TableCell>{nv(s.email)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(s.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Student Code</Label><Input value={form.student_code} onChange={e => setForm({ ...form, student_code: e.target.value })} placeholder="STU-001" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => createMut.mutate({ ...form, tenant_id: tenantId })} disabled={createMut.isPending}>{createMut.isPending ? "Adding..." : "Add Student"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SuperAdminStudentsPage;
