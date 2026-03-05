import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { schoolApi, nv } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { schoolNavItems } from "./navItems";

const AssignmentsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ teacher_id: "", subject_id: "", section_id: "" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: teachersData } = useQuery({ queryKey: ["teachers"], queryFn: schoolApi.teachers.list });
  const { data: subjectsData } = useQuery({ queryKey: ["subjects"], queryFn: schoolApi.subjects.list });
  const { data: sectionsData } = useQuery({ queryKey: ["sections"], queryFn: schoolApi.sections.list });
  const { data, isLoading } = useQuery({ queryKey: ["assignments"], queryFn: schoolApi.assignments.list });

  const teachers = teachersData?.data?.data ?? teachersData?.data ?? [];
  const subjects = subjectsData?.data?.data ?? subjectsData?.data ?? [];
  const sections = sectionsData?.data?.data ?? sectionsData?.data ?? [];
  const assignments = data?.data?.data ?? data?.data ?? [];

  const createMut = useMutation({ mutationFn: schoolApi.assignments.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); setCreateOpen(false); toast({ title: "Assignment Created" }); }});
  const deleteMut = useMutation({ mutationFn: schoolApi.assignments.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); toast({ title: "Assignment Removed" }); }});

  const getName = (list: any[], id: string, ...keys: string[]) => {
    const item = list.find((i: any) => i.id === id);
    if (!item) return id?.slice(0, 8) ?? "N/A";
    return keys.map(k => nv(item[k])).filter(Boolean).join(" ");
  };

  return (
    <DashboardLayout navItems={schoolNavItems} title="Teacher Assignments">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-semibold">Assignments</h2>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Assign Teacher</Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? <div className="p-6"><TableSkeleton /></div> : !Array.isArray(assignments) || assignments.length === 0 ? <EmptyState /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Teacher</TableHead><TableHead>Subject</TableHead><TableHead>Section</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {assignments.map((a: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{getName(teachers, a.teacher_id, "first_name", "last_name")}</TableCell>
                  <TableCell>{getName(subjects, a.subject_id, "name")}</TableCell>
                  <TableCell>{getName(sections, a.section_id, "name")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate({ teacher_id: a.teacher_id, subject_id: a.subject_id, section_id: a.section_id })} className="hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Teacher</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Teacher</Label>
              <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                <option value="">Select Teacher</option>
                {Array.isArray(teachers) && teachers.map((t: any) => <option key={t.id} value={t.id}>{nv(t.first_name)} {nv(t.last_name)}</option>)}
              </select>
            </div>
            <div>
              <Label>Subject</Label>
              <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                <option value="">Select Subject</option>
                {Array.isArray(subjects) && subjects.map((s: any) => <option key={s.id} value={s.id}>{nv(s.name)}</option>)}
              </select>
            </div>
            <div>
              <Label>Section</Label>
              <select value={form.section_id} onChange={e => setForm({ ...form, section_id: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                <option value="">Select Section</option>
                {Array.isArray(sections) && sections.map((s: any) => <option key={s.id} value={s.id}>{nv(s.name)}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter><Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending}>{createMut.isPending ? "Assigning..." : "Assign"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AssignmentsPage;
