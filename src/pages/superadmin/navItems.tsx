import { Building2, GraduationCap } from "lucide-react";

export const superAdminNavItems = [
  { label: "Dashboard", path: "/admin", icon: <Building2 className="w-4 h-4" /> },
  { label: "Tenants", path: "/admin/tenants", icon: <Building2 className="w-4 h-4" /> },
  { label: "Students", path: "/admin/students", icon: <GraduationCap className="w-4 h-4" /> },
];
