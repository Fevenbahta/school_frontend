import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { nv } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { schoolNavItems } from "./navItems";

interface CrudPageProps {
  title: string;
  queryKey: string;
  listFn: () => Promise<any>;
  createFn: (d: any) => Promise<any>;
  updateFn: (d: any) => Promise<any>;
  deleteFn: (id: string) => Promise<any>;
  columns: { key: string; label: string }[];
  formFields: { key: string; label: string; placeholder?: string }[];
  getFormDefaults: () => Record<string, string>;
  getEditFormData: (item: any) => Record<string, string>;
}

export default function CrudPage({
  title, queryKey, listFn, createFn, updateFn, deleteFn,
  columns, formFields, getFormDefaults, getEditFormData,
}: CrudPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(getFormDefaults());
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: listFn });
  const items = data?.data?.data ?? data?.data ?? [];

  const createMut = useMutation({ mutationFn: createFn, onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setCreateOpen(false); setForm(getFormDefaults()); toast({ title: `${title} Created` }); }});
  const updateMut = useMutation({ mutationFn: updateFn, onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setEditOpen(false); toast({ title: `${title} Updated` }); }});
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteFn(id), onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setDeleteId(null); toast({ title: `${title} Deleted` }); }});

  return (
    <DashboardLayout navItems={schoolNavItems} title={`Manage ${title}s`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-semibold">{title}s</h2>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add {title}</Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? <div className="p-6"><TableSkeleton /></div> : !Array.isArray(items) || items.length === 0 ? <EmptyState /> : (
          <Table>
            <TableHeader><TableRow>
              {columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id} className="group">
                  {columns.map(c => <TableCell key={c.key}>{nv(item[c.key])}</TableCell>)}
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => { setEditForm(getEditFormData(item)); setEditOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create {title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {formFields.map(f => (
              <div key={f.key}><Label>{f.label}</Label><Input value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} /></div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending}>{createMut.isPending ? "Creating..." : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {formFields.map(f => (
              <div key={f.key}><Label>{f.label}</Label><Input value={editForm[f.key] || ""} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} /></div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => updateMut.mutate(editForm)} disabled={updateMut.isPending}>{updateMut.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {title}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
