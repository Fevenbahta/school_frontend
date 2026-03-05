import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFound from "@/pages/NotFound";
import { SuperAdminDashboard, TenantsPage, SuperAdminStudentsPage } from "@/pages/superadmin";
import { SchoolDashboard, DepartmentsPage, SectionsPage, SubjectsPage, TeachersPage, AssignmentsPage } from "@/pages/school";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Super Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/tenants" element={<ProtectedRoute allowedRoles={["super_admin"]}><TenantsPage /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminStudentsPage /></ProtectedRoute>} />

              {/* School Admin */}
              <Route path="/school" element={<ProtectedRoute allowedRoles={["school_admin"]}><SchoolDashboard /></ProtectedRoute>} />
              <Route path="/school/departments" element={<ProtectedRoute allowedRoles={["school_admin"]}><DepartmentsPage /></ProtectedRoute>} />
              <Route path="/school/sections" element={<ProtectedRoute allowedRoles={["school_admin"]}><SectionsPage /></ProtectedRoute>} />
              <Route path="/school/subjects" element={<ProtectedRoute allowedRoles={["school_admin"]}><SubjectsPage /></ProtectedRoute>} />
              <Route path="/school/teachers" element={<ProtectedRoute allowedRoles={["school_admin"]}><TeachersPage /></ProtectedRoute>} />
              <Route path="/school/assignments" element={<ProtectedRoute allowedRoles={["school_admin"]}><AssignmentsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
