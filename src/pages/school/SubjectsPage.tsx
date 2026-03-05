import CrudPage from "./CrudPage";
import { schoolApi, nv } from "@/lib/api";

const SubjectsPage = () => CrudPage({
  title: "Subject", queryKey: "subjects",
  listFn: schoolApi.subjects.list, createFn: schoolApi.subjects.create,
  updateFn: schoolApi.subjects.update, deleteFn: schoolApi.subjects.delete,
  columns: [{ key: "name", label: "Name" }],
  formFields: [{ key: "name", label: "Name", placeholder: "e.g. Biology" }],
  getFormDefaults: () => ({ name: "" }),
  getEditFormData: (item: any) => ({ id: item.id, name: nv(item.name) }),
});

export default SubjectsPage;
