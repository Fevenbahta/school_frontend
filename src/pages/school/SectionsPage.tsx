import CrudPage from "./CrudPage";
import { schoolApi, nv } from "@/lib/api";

const SectionsPage = () => CrudPage({
  title: "Section", queryKey: "sections",
  listFn: schoolApi.sections.list, createFn: schoolApi.sections.create,
  updateFn: schoolApi.sections.update, deleteFn: schoolApi.sections.delete,
  columns: [{ key: "name", label: "Name" }, { key: "grade_level", label: "Grade" }, { key: "academic_year", label: "Year" }],
  formFields: [{ key: "name", label: "Name", placeholder: "Grade 10 A" }, { key: "grade_level", label: "Grade Level", placeholder: "10" }, { key: "academic_year", label: "Academic Year", placeholder: "2025-2026" }],
  getFormDefaults: () => ({ name: "", grade_level: "", academic_year: "" }),
  getEditFormData: (item: any) => ({ id: item.id, name: nv(item.name), grade_level: nv(item.grade_level), academic_year: nv(item.academic_year) }),
});

export default SectionsPage;
