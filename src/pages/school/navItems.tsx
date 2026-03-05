import { LayoutDashboard, Building, BookOpen, Users, Grid3X3, LinkIcon } from "lucide-react";

export const schoolNavItems = [
  { label: "Dashboard", path: "/school", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Departments", path: "/school/departments", icon: <Building className="w-4 h-4" /> },
  { label: "Sections", path: "/school/sections", icon: <Grid3X3 className="w-4 h-4" /> },
  { label: "Subjects", path: "/school/subjects", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Teachers", path: "/school/teachers", icon: <Users className="w-4 h-4" /> },
  { label: "Assignments", path: "/school/assignments", icon: <LinkIcon className="w-4 h-4" /> },
];
