import CrudPage from "./CrudPage";
import { schoolApi, nv } from "@/lib/api";

const TeachersPage = () => CrudPage({
  title: "Teacher", queryKey: "teachers",
  listFn: schoolApi.teachers.list, createFn: schoolApi.teachers.create,
  updateFn: schoolApi.teachers.update, deleteFn: schoolApi.teachers.delete,
  columns: [{ key: "first_name", label: "First Name" }, { key: "last_name", label: "Last Name" }, { key: "email", label: "Email" }],
  formFields: [{ key: "first_name", label: "First Name" }, { key: "last_name", label: "Last Name" }, { key: "email", label: "Email" }],
  getFormDefaults: () => ({ first_name: "", last_name: "", email: "" }),
  getEditFormData: (item: any) => ({ id: item.id, first_name: nv(item.first_name), last_name: nv(item.last_name), email: nv(item.email) }),
});

export default TeachersPage;
