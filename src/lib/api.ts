const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface NullableString {
  String: string;
  Valid: boolean;
}

interface NullableInt {
  Int64: number;
  Valid: boolean;
}

interface NullableTime {
  Time: string;
  Valid: boolean;
}

export const unwrapString = (v: NullableString | undefined): string => v?.Valid ? v.String : '';
export const unwrapInt = (v: NullableInt | undefined): number => v?.Valid ? v.Int64 : 0;
export const unwrapTime = (v: NullableTime | undefined): string => v?.Valid ? v.Time : '';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

async function downloadBlob(path: string): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return res.blob();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  changePassword: (old_password: string, new_password: string) =>
    request<any>('/api/v1/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ old_password, new_password }),
    }),

  // Super Admin - Tenants
  getTenants: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/superadmin/tenants?page=${page}&page_size=${pageSize}`),
  getTenant: (id: string) =>
    request<any>(`/api/v1/superadmin/tenants/${id}`),
  createTenant: (data: { name: string; address: string; phone: string }) =>
    request<{ id: string; admin_username: string; admin_password: string }>('/api/v1/superadmin/tenants', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateTenant: (data: { id: string; name: string; address: string; phone: string }) =>
    request<any>('/api/v1/superadmin/tenants', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteTenant: (id: string) =>
    request<any>(`/api/v1/superadmin/tenants/${id}`, { method: 'DELETE' }),
  activateTenant: (id: string) =>
    request<any>(`/api/v1/superadmin/tenants/${id}/activate`, { method: 'POST' }),
  deactivateTenant: (id: string) =>
    request<any>(`/api/v1/superadmin/tenants/${id}/deactivate`, { method: 'POST' }),

  // Super Admin - Students
  getStudentsSuperAdmin: (tenantId: string, page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/superadmin/students?tenant_id=${tenantId}&page=${page}&page_size=${pageSize}`),
  createStudentSuperAdmin: (data: { tenant_id: string; student_code: string; first_name: string; last_name: string; email: string; section_id?: string; department_id?: string }) =>
    request<{ student_id: string; username: string; password: string }>('/api/v1/superadmin/students', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateStudentSuperAdmin: (id: string, data: any) =>
    request<any>(`/api/v1/superadmin/students/${id}`, {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteStudentSuperAdmin: (id: string) =>
    request<any>(`/api/v1/superadmin/students/${id}`, { method: 'DELETE' }),
  importStudentsSuperAdmin: (tenantId: string, file: File) => {
    const formData = new FormData();
    formData.append('tenant_id', tenantId);
    formData.append('file', file);
    return request<any>('/api/v1/superadmin/students/import', {
      method: 'POST', body: formData,
    });
  },

  // School Admin - Departments
  getDepartments: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/school/departments?page=${page}&page_size=${pageSize}`),
  createDepartment: (data: { name: string }) =>
    request<{ id: string }>('/api/v1/school/departments', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateDepartment: (data: { id: string; name: string }) =>
    request<any>('/api/v1/school/departments', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteDepartment: (id: string) =>
    request<any>(`/api/v1/school/departments/${id}`, { method: 'DELETE' }),

  // School Admin - Sections
  getSections: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/school/sections?page=${page}&page_size=${pageSize}`),
  createSection: (data: { name: string; grade_level: string; academic_year: string }) =>
    request<{ id: string }>('/api/v1/school/sections', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateSection: (data: { id: string; name: string }) =>
    request<any>('/api/v1/school/sections', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteSection: (id: string) =>
    request<any>(`/api/v1/school/sections/${id}`, { method: 'DELETE' }),

  // School Admin - Subjects
  getSubjects: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/school/subjects?page=${page}&page_size=${pageSize}`),
  createSubject: (data: { name: string }) =>
    request<{ id: string }>('/api/v1/school/subjects', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateSubject: (data: { id: string; name: string }) =>
    request<any>('/api/v1/school/subjects', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteSubject: (id: string) =>
    request<any>(`/api/v1/school/subjects/${id}`, { method: 'DELETE' }),

  // School Admin - Teachers
  getTeachers: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/school/teachers?page=${page}&page_size=${pageSize}`),
  createTeacher: (data: { first_name: string; last_name: string; email: string }) =>
    request<{ teacher_id: string; username: string; password: string }>('/api/v1/school/teachers', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateTeacher: (data: { id: string; first_name?: string; last_name?: string }) =>
    request<any>('/api/v1/school/teachers', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteTeacher: (id: string) =>
    request<any>(`/api/v1/school/teachers/${id}`, { method: 'DELETE' }),

  // School Admin - Assignments
  getAssignments: () =>
    request<any[]>('/api/v1/school/assignments'),
  createAssignment: (data: { teacher_id: string; subject_id: string; section_id: string }) =>
    request<any>('/api/v1/school/assignments', {
      method: 'POST', body: JSON.stringify(data),
    }),
  deleteAssignment: (data: { teacher_id: string; subject_id: string; section_id: string }) =>
    request<any>('/api/v1/school/assignments', {
      method: 'DELETE', body: JSON.stringify(data),
    }),

  // School Admin - Violations
  getViolations: () =>
    request<any[]>('/api/v1/school/violations'),

  // Teacher - Question Banks
  getQuestionBanks: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/teacher/question-banks?page=${page}&page_size=${pageSize}`),
  createQuestionBank: (data: { subject_id: string; title: string }) =>
    request<{ id: string }>('/api/v1/teacher/question-banks', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // Teacher - Questions
  getQuestions: (bankId: string, page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/teacher/questions?bank_id=${bankId}&page=${page}&page_size=${pageSize}`),
  createQuestion: (data: { question_bank_id: string; type: string; question_text: string; marks: number; difficulty_level: string }) =>
    request<{ id: string }>('/api/v1/teacher/questions', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateQuestion: (data: { id: string; question_text?: string }) =>
    request<any>('/api/v1/teacher/questions', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteQuestion: (id: string) =>
    request<any>(`/api/v1/teacher/questions/${id}`, { method: 'DELETE' }),
  importQuestions: (bankId: string, file: File) => {
    const formData = new FormData();
    formData.append('bank_id', bankId);
    formData.append('file', file);
    return request<any>('/api/v1/teacher/questions/import', {
      method: 'POST', body: formData,
    });
  },

  // Teacher - Options
  getOptions: (questionId: string, page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/teacher/options?question_id=${questionId}&page=${page}&page_size=${pageSize}`),
  createOption: (data: { question_id: string; option_text: string; is_correct: boolean }) =>
    request<{ id: string }>('/api/v1/teacher/options', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateOption: (data: { id: string; option_text: string; is_correct: boolean }) =>
    request<any>('/api/v1/teacher/options', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  deleteOption: (id: string) =>
    request<any>(`/api/v1/teacher/options/${id}`, { method: 'DELETE' }),

  // Teacher - Exams
  getExams: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/teacher/exams?page=${page}&page_size=${pageSize}`),
  getExam: (id: string) =>
    request<any>(`/api/v1/teacher/exams/${id}`),
  createExam: (data: { title: string; subject_id: string; section_id: string; duration_minutes: number; start_time: string; end_time: string }) =>
    request<{ id: string }>('/api/v1/teacher/exams', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateExam: (data: { id: string; title?: string; shuffle_options?: boolean }) =>
    request<any>('/api/v1/teacher/exams', {
      method: 'PATCH', body: JSON.stringify(data),
    }),
  updateExamStatus: (id: string, status: string) =>
    request<any>(`/api/v1/teacher/exams/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }),
  addExamQuestions: (data: { exam_id: string; questions: { question_id: string; marks: number; order_index: number }[]; shuffle_options?: boolean }) =>
    request<any>('/api/v1/teacher/exams/questions', {
      method: 'POST', body: JSON.stringify(data),
    }),
  addRandomExamQuestions: (data: { exam_id: string; question_bank_id: string; count: number; marks: number; shuffle_options?: boolean }) =>
    request<any>('/api/v1/teacher/exams/questions/random', {
      method: 'POST', body: JSON.stringify(data),
    }),
  deleteExamQuestion: (examQuestionId: string, examId: string) =>
    request<any>(`/api/v1/teacher/exams/questions/${examQuestionId}?exam_id=${examId}`, { method: 'DELETE' }),
  getExamQuestions: (examId: string) =>
    request<any>(`/api/v1/teacher/exams/${examId}/questions`),
  getExamMarks: (examId: string) =>
    request<any>(`/api/v1/teacher/exams/${examId}/marks`),
  downloadExamMarks: (examId: string) =>
    downloadBlob(`/api/v1/teacher/exams/${examId}/marks/download`),
  getTeacherStudents: (page = 1, pageSize = 20) =>
    request<any[]>(`/api/v1/teacher/students?page=${page}&page_size=${pageSize}`),

  // Teacher - My Assignments
  getMyAssignments: () =>
    request<any[]>('/api/v1/teacher/my-assignments'),

  // Teacher helper: get subjects/sections from my assignments
  getTeacherSubjects: async () => {
    const assignments = await api.getMyAssignments().catch(() => [] as any[]);
    const map = new Map<string, string>();
    (assignments || []).forEach((a: any) => { if (a.subject_id) map.set(a.subject_id, a.subject_name); });
    return Array.from(map, ([subject_id, subject_name]) => ({ subject_id, subject_name }));
  },
  getTeacherSections: async () => {
    const assignments = await api.getMyAssignments().catch(() => [] as any[]);
    const map = new Map<string, string>();
    (assignments || []).forEach((a: any) => { if (a.section_id) map.set(a.section_id, a.section_name); });
    return Array.from(map, ([section_id, section_name]) => ({ section_id, section_name }));
  },

  // Student - Exams
  getStudentExams: () =>
    request<any[]>('/api/v1/student/exams'),
  getStudentExam: (id: string) =>
    request<any>(`/api/v1/student/exams/${id}`),

  // Student - Sessions
  getStudentSessions: () =>
    request<any[]>('/api/v1/student/sessions'),
  startSession: (examId: string) =>
    request<{ id: string }>('/api/v1/student/sessions/start', {
      method: 'POST', body: JSON.stringify({ exam_id: examId }),
    }),
  submitAnswer: (data: { session_id: string; question_id: string; selected_option_id: string }) =>
    request<any>('/api/v1/student/sessions/answers', {
      method: 'POST', body: JSON.stringify(data),
    }),
  submitSession: (sessionId: string) =>
    request<any>('/api/v1/student/sessions/submit', {
      method: 'POST', body: JSON.stringify({ session_id: sessionId }),
    }),
  getSession: (sessionId: string) =>
    request<any>(`/api/v1/student/sessions/${sessionId}`),
};
