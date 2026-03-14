import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TenantsPage from "@/pages/superadmin/TenantsPage";
import SAStudentsPage from "@/pages/superadmin/SAStudentsPage";
import DepartmentsPage from "@/pages/school/DepartmentsPage";
import SectionsPage from "@/pages/school/SectionsPage";
import SubjectsPage from "@/pages/school/SubjectsPage";
import TeachersPage from "@/pages/school/TeachersPage";
import AssignmentsPage from "@/pages/school/AssignmentsPage";
import ViolationsPage from "@/pages/school/ViolationsPage";
import QuestionBanksPage from "@/pages/teacher/QuestionBanksPage";
import QuestionsPage from "@/pages/teacher/QuestionsPage";
import ExamsPage from "@/pages/teacher/ExamsPage";
import TeacherStudentsPage from "@/pages/teacher/TeacherStudentsPage";
import StudentExamsPage from "@/pages/student/StudentExamsPage";
import StudentResultsPage from "@/pages/student/StudentResultsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Super Admin */}
        {user.role === 'super_admin' && <>
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/sa-students" element={<SAStudentsPage />} />
        </>}
        {/* School Admin */}
        {user.role === 'school_admin' && <>
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/sections" element={<SectionsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/violations" element={<ViolationsPage />} />
        </>}
        {/* Teacher */}
        {user.role === 'teacher' && <>
          <Route path="/question-banks" element={<QuestionBanksPage />} />
          <Route path="/question-banks/:bankId" element={<QuestionsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/t-students" element={<TeacherStudentsPage />} />
        </>}
        {/* Student */}
        {user.role === 'student' && <>
          <Route path="/my-exams" element={<StudentExamsPage />} />
          <Route path="/my-results" element={<StudentResultsPage />} />
        </>}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
