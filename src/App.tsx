import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, Zoom } from "react-toastify";
import Cookies from "js-cookie";
import { useHasPermission, ADMIN_PERMISSIONS } from "@/hooks/useAuth";
import AdminLayout from "./components/AdminLayout";
import CompanyLayout from "./components/CompanyLayout";
import Login from "@/pages/auth/LoginPage";
import VerifyOtp from "@/pages/auth/VerifyOtpPage";
import ForgotPassword from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordOtp from "@/pages/auth/ResetPasswordOtpPage";
import ResetPassword from "@/pages/auth/ResetPasswordPage";
import Dashboard from "@/pages/companys/dashboard/DashboardPage";
import Contacts from "@/pages/contacts/ContactsPage";
import Leads from "./pages/companys/leads/LeadsPage";
import LeadDetailsPage from "./pages/companys/leads/details/LeadDetailsPage";
import Salesmen from "@/pages/companys/salesmen/SalesmenPage";
import SalesmanDetail from "@/pages/companys/salesmen/SalesmanDetailPage";
import Tasks from "@/pages/admin/tasks/TasksPage";
import Parties from "@/pages/companys/parties/PartiesPage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import InboxPage from "@/pages/admin/inbox/InboxPage";
import Products from "@/pages/common/products/ProductsPage";
import ProductFormPage from "@/pages/common/products/ProductFormPage";
import Roles from "@/pages/admin/roles/RolesPage";
import RoleDetail from "@/pages/admin/roles/RoleDetail";
import Users from "@/pages/admin/users/UsersPage";
import UserDetail from "@/pages/admin/users/UserDetail";
import Suppliers from "@/pages/companys/suppliers/SuppliersPage";
import SupplierDetail from "@/pages/companys/suppliers/SupplierDetailPage";
import AttendancePage from "./pages/companys/attendance/AttendancePage";
import EmployeesPage from "./pages/companys/employees/EmployeesPage";
import EmployeeDetailPage from "./pages/companys/employees/EmployeeDetailPage";
import CompaniesPage from "@/pages/admin/companies/CompaniesPage";
import CompanyDetailPage from "@/pages/admin/companies/CompanyDetailPage";
import NotFound from "@/pages/errors/NotFoundPage";
import ProductCategoriesPage from "@/pages/common/product-categories/ProductCategoriesPage";
import CategoryDetailPage from "@/pages/common/product-categories/CategoryDetailPage";
import BrandsPage from "@/pages/common/brands/BrandsPage";
import FragrancesPage from "@/pages/common/fragrances/FragrancesPage";
import PackagesPage from "@/pages/common/packages/PackagesPage";
import BomPage from "@/pages/common/bom/BomPage";
import KitsPage from "@/pages/common/kits/KitsPage";
import KitFormPage from "@/pages/common/kits/KitFormPage";
import NoCompanyAccessPage from "@/pages/errors/NoCompanyAccessPage";
import BatchesPage from "@/pages/companys/batches/BatchesPage";
import BatchFormPage from "@/pages/companys/batches/BatchFormPage";
import SerialNumbersPage from "@/pages/companys/serials/SerialNumbersPage";
import GenerateSerialsPage from "@/pages/companys/serials/GenerateSerialsPage";
import InventoriesPage from "@/pages/admin/inventory/InventoriesPage";
import AccountPage from "./pages/common/account/AccountPage";
import AccountViewPage from "./pages/common/account/AccountViewPage";
import StatusPage from "./pages/companys/leads/status/StatusPage";
import SourcePage from "./pages/companys/leads/source/SourcePage";
import InventoryDetailPage from "@/pages/admin/inventory/InventoryDetailPage";
import VisitsPage from "./pages/companys/leads/visits/VisitsPage";
import TasksPage from "./pages/companys/leads/tasks/TasksPage";
import RemindersPage from "./pages/companys/leads/reminders/RemindersPage";
import FollowUpsPage from "./pages/companys/leads/followups/FollowUps";
import SalesPage from "./pages/companys/sales/SalesPage";
import SalesMemberDetailPage from "./pages/companys/sales/SalesMemberDetailPage";
import HierarchyPage from "./pages/admin/hierarchy/hierarchyPage";

const queryClient = new QueryClient();

function getStoredUser() {
  try {
    const raw = Cookies.get("user_details");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  const token = Cookies.get("auth_token");
  if (!token || !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  const token = Cookies.get("auth_token");
  if (token && user) {
    if (user.is_root_user) return <Navigate to="/admin" replace />;
    const companyId = user.companies?.[0]?.id || "no-access";
    return <Navigate to={`/${companyId}/dashboard`} replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { hasPermission, isLoading } = useHasPermission();

  const user = getStoredUser();
  const token = Cookies.get("auth_token");
  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.is_root_user) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPermission(ADMIN_PERMISSIONS)) {
    return (
      <Navigate
        to={`/${user.companies?.[0]?.id || "no-access"}/dashboard`}
        replace
      />
    );
  }

  return <>{children}</>;
}

function AdminIndexRedirect() {
  const { hasPermission, isLoading } = useHasPermission();
  const user = getStoredUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Navigate to="companies" replace />;
}

function DashboardRedirect() {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  const companyId = user.companies?.[0]?.id || "no-access";
  return <Navigate to={`/${companyId}/dashboard`} replace />;
}

function PermissionRoute({ permission, children, fallback = "/no-access" }: { permission: string | string[], children: React.ReactNode, fallback?: string }) {
  const { hasPermission, isLoading } = useHasPermission();
  const user = getStoredUser();

  if (!user) return <Navigate to="/login" replace />;
  if (user.is_root_user) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

function RootOnlyRoute({ children, fallback = "/no-access" }: { children: React.ReactNode, fallback?: string }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_root_user) return <>{children}</>;
  return <Navigate to={fallback} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Navigate to="/login" replace />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/company-selection"
          element={<Navigate to="/admin/companies" replace />}
        />
        <Route
          path="/no-access"
          element={
            <PrivateRoute>
              <NoCompanyAccessPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRedirect />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminIndexRedirect />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="recipes" element={<BomPage />} />
          <Route path="kits" element={<KitsPage />} />
          <Route path="kits/new" element={<KitFormPage />} />
          <Route path="kits/edit/:id" element={<KitFormPage />} />
          <Route
            path="product-categories"
            element={<ProductCategoriesPage />}
          />
          <Route
            path="product-categories/:id"
            element={<CategoryDetailPage />}
          />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="fragrances" element={<FragrancesPage />} />
          <Route path="users" element={<PermissionRoute permission="user.read" fallback="/admin"><Users /></PermissionRoute>} />
          <Route path="users/:id" element={<PermissionRoute permission="user.read" fallback="/admin"><UserDetail /></PermissionRoute>} />
          <Route path="roles" element={<PermissionRoute permission="role.read" fallback="/admin"><Roles /></PermissionRoute>} />
          <Route path="roles/:id" element={<PermissionRoute permission="role.read" fallback="/admin"><RoleDetail /></PermissionRoute>} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="batches/new" element={<BatchFormPage />} />
          <Route path="batches/edit/:id" element={<BatchFormPage />} />
          <Route path="serials" element={<SerialNumbersPage />} />
          <Route path="serials/generate" element={<GenerateSerialsPage />} />
          <Route path="inventory" element={<InventoriesPage />} />
          <Route path="inventory/:type/:id" element={<InventoryDetailPage />} />
          <Route path="accounts" element={<AccountPage />} />
          <Route path="accounts/:id" element={<AccountViewPage />} />
          <Route path="hierarchy" element={<HierarchyPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Company Routes – protected */}
        <Route
          path="/:companyId"
          element={
            <PrivateRoute>
              <CompanyLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route
            path="product-categories"
            element={<ProductCategoriesPage />}
          />
          <Route
            path="product-categories/:id"
            element={<CategoryDetailPage />}
          />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="fragrances" element={<FragrancesPage />} />
          <Route path="recipes" element={<BomPage />} />
          <Route path="kits" element={<KitsPage />} />
          <Route path="kits/new" element={<KitFormPage />} />
          <Route path="kits/edit/:id" element={<KitFormPage />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetailsPage />} />
          <Route path="salesmen" element={<Salesmen />} />
          <Route path="salesmen/:id" element={<SalesmanDetail />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="parties" element={<Parties />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="batches/new" element={<BatchFormPage />} />
          <Route path="batches/edit/:id" element={<BatchFormPage />} />
          <Route path="serials" element={<SerialNumbersPage />} />
          <Route path="serials/generate" element={<GenerateSerialsPage />} />
          <Route path="inventory" element={<InventoriesPage />} />
          <Route path="inventory/:type/:id" element={<InventoryDetailPage />} />
          <Route path="accounts" element={<AccountPage />} />
          <Route path="accounts/:id" element={<AccountViewPage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="source" element={<SourcePage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="followups" element={<FollowUpsPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales/:userId" element={<SalesMemberDetailPage />} />
          <Route
            path="sales/:userId/:tab"
            element={<SalesMemberDetailPage />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
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
