import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function nv(field: any): string {
  if (field === null || field === undefined) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && "Valid" in field) {
    return field.Valid ? field.String : "";
  }
  return String(field);
}

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post<{ token: string }>("/auth/login", data),
};

export const tenantsApi = {
  list: (page = 1, pageSize = 20) =>
    api.get(`/superadmin/tenants?page=${page}&page_size=${pageSize}`),
  create: (data: { name: string; address: string; phone: string }) =>
    api.post("/superadmin/tenants", data),
  update: (data: { id: string; name: string; address: string; phone: string }) =>
    api.patch("/superadmin/tenants", data),
  delete: (id: string) => api.delete(`/superadmin/tenants/${id}`),
  activate: (id: string) => api.post(`/superadmin/tenants/${id}/activate`),
  deactivate: (id: string) => api.post(`/superadmin/tenants/${id}/deactivate`),
};

export const superStudentsApi = {
  list: (tenantId: string, page = 1, pageSize = 20) =>
    api.get(`/superadmin/students?tenant_id=${tenantId}&page=${page}&page_size=${pageSize}`),
  create: (data: { tenant_id: string; student_code: string; first_name: string; last_name: string; email: string }) =>
    api.post("/superadmin/students", data),
  update: (id: string, data: { id: string; first_name?: string; last_name?: string }) =>
    api.patch(`/superadmin/students/${id}`, data),
  delete: (id: string) => api.delete(`/superadmin/students/${id}`),
  import: (tenantId: string, file: File) => {
    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("file", file);
    return api.post("/superadmin/students/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const schoolApi = {
  departments: {
    create: (data: { name: string }) => api.post("/school/departments", data),
    list: () => api.get("/school/departments"),
    update: (data: { id: string; name: string }) => api.patch("/school/departments", data),
    delete: (id: string) => api.delete(`/school/departments/${id}`),
  },
  sections: {
    create: (data: { name: string; grade_level: string; academic_year: string }) =>
      api.post("/school/sections", data),
    list: () => api.get("/school/sections"),
    update: (data: { id: string; name?: string }) => api.patch("/school/sections", data),
    delete: (id: string) => api.delete(`/school/sections/${id}`),
  },
  subjects: {
    create: (data: { name: string }) => api.post("/school/subjects", data),
    list: () => api.get("/school/subjects"),
    update: (data: { id: string; name: string }) => api.patch("/school/subjects", data),
    delete: (id: string) => api.delete(`/school/subjects/${id}`),
  },
  teachers: {
    create: (data: { first_name: string; last_name: string; email: string }) =>
      api.post("/school/teachers", data),
    list: () => api.get("/school/teachers"),
    update: (data: { id: string; first_name?: string; last_name?: string }) =>
      api.patch("/school/teachers", data),
    delete: (id: string) => api.delete(`/school/teachers/${id}`),
  },
  assignments: {
    create: (data: { teacher_id: string; subject_id: string; section_id: string }) =>
      api.post("/school/assignments", data),
    list: () => api.get("/school/assignments"),
    delete: (data: { teacher_id: string; subject_id: string; section_id: string }) =>
      api.delete("/school/assignments", { data }),
  },
};

export default api;
