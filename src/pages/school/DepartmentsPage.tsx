import CrudPage from "./CrudPage";
import { schoolApi, nv } from "@/lib/api";

const DepartmentsPage = () => CrudPage({
  title: "Department", queryKey: "departments",
  listFn: schoolApi.departments.list, createFn: schoolApi.departments.create,
  updateFn: schoolApi.departments.update, deleteFn: schoolApi.departments.delete,
  columns: [{ key: "name", label: "Name" }],
  formFields: [{ key: "name", label: "Name", placeholder: "e.g. Science" }],
  getFormDefaults: () => ({ name: "" }),
  getEditFormData: (item: any) => ({ id: item.id, name: nv(item.name) }),
});

export default DepartmentsPage;
