import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { tenantsApi, nv } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { superAdminNavItems } from "./navItems";

const TenantsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [editForm, setEditForm] = useState({ id: "", name: "", address: "", phone: "" });

  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tenants", page], queryFn: () => tenantsApi.list(page, 20) });
  const tenants = data?.data?.data ?? data?.data ?? [];

  const createMut = useMutation({ mutationFn: tenantsApi.create, onSuccess: (res) => {
    qc.invalidateQueries({ queryKey: ["tenants"] }); setCreateOpen(false); setForm({ name: "", address: "", phone: "" });
    const d = res.data;
    toast({ title: "Tenant Created", description: `Username: ${d.admin_username ?? "N/A"} | Password: ${d.admin_password ?? "N/A"}` });
  }});
  const updateMut = useMutation({ mutationFn: tenantsApi.update, onSuccess: () => { qc.invalidateQueries({ queryKey: ["tenants"] }); setEditOpen(false); toast({ title: "Tenant Updated" }); }});
  const deleteMut = useMutation({ mutationFn: tenantsApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ["tenants"] }); setDeleteId(null); toast({ title: "Tenant Deleted" }); }});
  const activateMut = useMutation({ mutationFn: tenantsApi.activate, onSuccess: () => { qc.invalidateQueries({ queryKey: ["tenants"] }); toast({ title: "Tenant Activated" }); }});
  const deactivateMut = useMutation({ mutationFn: tenantsApi.deactivate, onSuccess: () => { qc.invalidateQueries({ queryKey: ["tenants"] }); toast({ title: "Tenant Deactivated" }); }});

  const filtered = Array.isArray(tenants) ? tenants.filter((t: any) => nv(t.name).toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <DashboardLayout navItems={superAdminNavItems} title="Manage Tenants">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Tenant</Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? <div className="p-6"><TableSkeleton /></div> : filtered.length === 0 ? <EmptyState /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((t: any) => (
                <TableRow key={t.id} className="group">
                  <TableCell className="font-medium">{nv(t.name)}</TableCell>
                  <TableCell>{nv(t.address)}</TableCell>
                  <TableCell>{nv(t.phone)}</TableCell>
                  <TableCell>
                    <Badge variant={t.is_active ? "default" : "secondary"} className="cursor-pointer"
                      onClick={() => t.is_active ? deactivateMut.mutate(t.id) : activateMut.mutate(t.id)}>
                      {t.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => { setEditForm({ id: t.id, name: nv(t.name), address: nv(t.address), phone: nv(t.phone) }); setEditOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)} className="hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="flex items-center text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Tenant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending}>{createMut.isPending ? "Creating..." : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tenant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => updateMut.mutate(editForm)} disabled={updateMut.isPending}>{updateMut.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Tenant?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TenantsPage;
