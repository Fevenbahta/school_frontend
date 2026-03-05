import { useQuery } from "@tanstack/react-query";
import { Building, BookOpen, Users, Grid3X3 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { schoolApi } from "@/lib/api";
import { schoolNavItems } from "./navItems";

const SchoolDashboard = () => {
  const { data: depts } = useQuery({ queryKey: ["departments"], queryFn: schoolApi.departments.list });
  const { data: sections } = useQuery({ queryKey: ["sections"], queryFn: schoolApi.sections.list });
  const { data: subjects } = useQuery({ queryKey: ["subjects"], queryFn: schoolApi.subjects.list });
  const { data: teachers } = useQuery({ queryKey: ["teachers"], queryFn: schoolApi.teachers.list });

  const count = (d: any) => { const arr = d?.data?.data ?? d?.data ?? []; return Array.isArray(arr) ? arr.length : 0; };

  return (
    <DashboardLayout navItems={schoolNavItems} title="School Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Departments" value={count(depts)} icon={Building} />
        <KPICard title="Sections" value={count(sections)} icon={Grid3X3} />
        <KPICard title="Subjects" value={count(subjects)} icon={BookOpen} />
        <KPICard title="Teachers" value={count(teachers)} icon={Users} />
      </div>
    </DashboardLayout>
  );
};

export default SchoolDashboard;
