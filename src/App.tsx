import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, Zoom } from 'react-toastify';
import AdminLayout from "./components/AdminLayout";
import CompanyLayout from "./components/CompanyLayout";
import Login from "@/pages/auth/LoginPage";
import VerifyOtp from "@/pages/auth/VerifyOtpPage";
import Dashboard from "@/pages/dashboard/DashboardPage";
import Contacts from "@/pages/contacts/ContactsPage";
import Leads from "@/pages/leads/LeadsPage";
import Salesmen from "@/pages/salesmen/SalesmenPage";
import SalesmanDetail from "@/pages/salesmen/SalesmanDetailPage";
import Tasks from "@/pages/tasks/TasksPage";
import Parties from "@/pages/parties/PartiesPage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import InboxPage from "@/pages/inbox/InboxPage";
import Settings from "@/pages/settings/SettingsPage";
import Products from "@/pages/products/ProductsPage";
import Roles from "@/pages/roles/RolesPage";
import RoleDetail from "@/pages/roles/RoleDetail";
import Users from "@/pages/users/UsersPage";
import UserDetail from "@/pages/users/UserDetail";
import Suppliers from "@/pages/suppliers/SuppliersPage";
import SupplierDetail from "@/pages/suppliers/SupplierDetailPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeeDetailPage from "./pages/employees/EmployeeDetailPage";
import CompanySelection from "@/pages/company-selection/CompanySelectionPage";
import NotFound from "@/pages/errors/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/company-selection" element={<CompanySelection />} />

          {/* Company Routes */}
          <Route path="/:companyId" element={<CompanyLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="products" element={<Products />} />
            <Route path="leads" element={<Leads />} />
            <Route path="salesmen" element={<Salesmen />} />
            <Route path="salesmen/:id" element={<SalesmanDetail />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/:id" element={<SupplierDetail />} />
            <Route path="parties" element={<Parties />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="roles" element={<Roles />} />
            <Route path="roles/:id" element={<RoleDetail />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        transition={Zoom}
        limit={0}
      />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
