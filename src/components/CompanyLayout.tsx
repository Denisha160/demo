import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate, Outlet, useParams } from "react-router-dom";
import {
  LayoutDashboard, Users, Kanban, LogOut, Menu, ChevronDown,
  Bell, PanelLeftClose, PanelLeft, Box, ShieldCheck, List,
  UserCheck, Truck, Clock, Tags, Blocks,
  Package, Hash, Award, Wind, FileChartColumn, Landmark, FileScan
} from "lucide-react";

import { useLogout, useCurrentUser, useHasPermission } from "@/hooks/useAuth";
import { createPortal } from "react-dom";
import { getCompanyTheme } from "@/data/companyData";
import { useCompanies } from "@/hooks/useCompanies";
import { Loader2 } from "lucide-react";
import { Company } from "@/types/company";

interface CompanyLayoutProps {
  title?: string;
}

interface NavItemEntry {
  label: string;
  icon: React.ElementType;
  path?: string;
  permission?: string | string[];
  children?: NavItemEntry[];
}

const navItems: NavItemEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  {
    label: "CRM",
    icon: Blocks,
    children: [
      { label: "Leads", icon: Box, path: "leads"},
      { label: "Status", icon: List, path: "status" },
      { label: "Sources", icon: Package, path: "source" },
      { label: "Quotations", icon: Package, path: "quotations" },
      { label: "Visites", icon: Package, path: "visites" },
      { label: "Reminders", icon: Package, path: "reminders" },
      { label: "Follow-ups", icon: Package, path: "followups" },
    ]
  },
  // { label: "Salesmen", icon: UserCheck, path: "salesmen"},
  // { label: "Employees", icon: Users, path: "employees"},
  // { label: "Attendance", icon: Clock, path: "attendance" },  
  // { label: "Suppliers", icon: Truck, path: "suppliers" },
  // { label: "Parties", icon: Users, path: "parties" },
  {
    label: "Product Setup",
    icon: Blocks,
    children: [
      { label: "Products", icon: Box, path: "products", permission: "product.read" },
      { label: "Recipes", icon: List, path: "recipes", permission: "product-bom.read" },
      { label: "Kits", icon: Package, path: "kits", permission: "product-kit.read" },
      { label: "Categories", icon: Tags, path: "product-categories", permission: "product-category.read" },
      { label: "Brands", icon: Award, path: "brands", permission: "product-brand.read" },
      { label: "Fragrances", icon: Wind, path: "fragrances", permission: "product-fragrance.read" },
    ]
  },
  { label: "Batches", icon: Blocks, path: "batches", permission: "inventory-batch.read" },
  { label: "Serial Numbers", icon: Hash, path: "serials", permission: "inventory-serial.read" },
  // { label: "Accounts", icon: Landmark, path: "accounts" },
];


interface NavGroupProps {
  item: NavItemEntry & { children: NavItemEntry[] };
  active: boolean;
  onCloseSidebar: () => void;
  currentCompany: Company;
  location: { pathname: string };
}

const NavGroup = ({ item, active, onCloseSidebar, currentCompany, location }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(active);

  useEffect(() => {
    if (active) setIsOpen(true);
  }, [active]);

  const theme = getCompanyTheme(currentCompany.id, currentCompany.display_name || currentCompany.legal_name);

  const getFullActive = (path?: string) => {
    if (!path) return false;
    const itemPath = `/${currentCompany.id}/${path}`;
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");
  };

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-2 py-2 text-sm rounded-md transition-all duration-200 group
          ${active ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-accent"}
        `}
        style={active ? { color: `hsl(${theme.primary})` } : {}}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4 w-4 shrink-0 transition-colors" />
          <span>{item.label}</span>
        </div>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 opacity-50 group-hover:opacity-100 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="ml-4 pl-3 border-l border-border/60 space-y-0.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {item.children.map((child) => {
            const childActive = getFullActive(child.path);
            return (
              <Link
                key={child.path}
                to={`/${currentCompany.id}/${child.path}`}
                onClick={onCloseSidebar}
                className={`
                  flex items-center gap-3 px-2 py-1.5 text-[13px] rounded-md transition-all duration-200
                  ${childActive
                    ? "bg-primary/15 text-primary font-bold"
                    : "text-muted-foreground/80 hover:text-foreground hover:bg-accent"
                  }
                `}
                style={childActive ? { color: `hsl(${theme.primary})` } : {}}
              >
                <child.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CompanyLayout = ({ title }: CompanyLayoutProps) => {
  const { companyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const user = useCurrentUser();
  const { hasPermission } = useHasPermission();
  const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies();
  const companies = useMemo(() => companiesData?.items || [], [companiesData?.items]);

  const currentCompany = useMemo(() => {
    if (companies.length === 0) return null;
    return companies.find((c: Company) => c.id === companyId) ||
      companies.find((c: Company) => c.id === localStorage.getItem("currentCompanyId")) ||
      companies[0];
  }, [companyId, companies]);

  const getFullActive = (path?: string) => {
    if (!currentCompany || !path) return false;
    const itemPath = `/${currentCompany.id}/${path}`;
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");
  };
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'ME';

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (currentCompany) {
      const theme = getCompanyTheme(currentCompany.id, currentCompany.display_name || currentCompany.legal_name);
      const root = document.documentElement;
      root.style.setProperty("--primary", theme.primary);
      root.style.setProperty("--ring", theme.ring);
      root.style.setProperty("--sidebar-primary", theme.primary);
      root.style.setProperty("--sidebar-ring", theme.ring);
      localStorage.setItem("currentCompanyId", currentCompany.id);
    }
  }, [currentCompany]);

  const toggleCompany = (company: Company) => {
    setIsCompanyDropdownOpen(false);
    // When switching company, navigate to the new company's dashboard
    const currentPath = location.pathname.split("/").slice(2).join("/");
    navigate(`/${company.id}/${currentPath || 'dashboard'}`);
  };

  const activeNavItem = navItems.find(item => {
    if (!currentCompany) return false;
    if (item.children) {
      return item.children.some(child => getFullActive(child.path));
    }
    return getFullActive(item.path);
  });

  const pageTitle = title || activeNavItem?.label || "CRM";

  if (isLoadingCompanies || !currentCompany) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTheme = getCompanyTheme(currentCompany.id, currentCompany.display_name || currentCompany.legal_name);

  return (
    <div className="flex h-screen bg-secondary/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarCollapsed ? "lg:w-0 lg:border-r-0 lg:overflow-hidden lg:-translate-x-full" : "lg:w-56 lg:translate-x-0"}
        w-56
      `}>
        <div className="p-2 border-b lg:border-b-0">
          <div className="flex items-center gap-1">
            {/* Company Selector */}
            <div className="relative flex-1 min-w-0">
              <button
                onClick={() => (user?.is_root_user || companies.length > 1) && setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className={`flex items-center gap-2 w-full h-9 px-2 rounded-md transition-colors text-left overflow-hidden ${user?.is_root_user || companies.length > 1 ? 'hover:bg-accent' : 'cursor-default'}`}
              >
                <div className="h-6 w-6 bg-primary text-primary-foreground flex items-center justify-center rounded-sm shrink-0">
                  <span className="text-[10px] font-bold">{currentTheme.initials}</span>
                </div>
                <span className="flex-1 text-sm font-semibold truncate leading-none text-foreground">
                  {currentCompany.display_name || currentCompany.legal_name}
                </span>
                {(user?.is_root_user || companies.length > 1) && (
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Dropdown Menu */}
              {isCompanyDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Switch Company</div>
                    {companies.map((company: Company) => {
                      const theme = getCompanyTheme(company.id, company.display_name || company.legal_name);
                      return (
                        <button
                          key={company.id}
                          onClick={() => toggleCompany(company)}
                          className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm transition-colors text-left
                            ${currentCompany.id === company.id ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'}
                          `}
                        >
                          <div className={`h-5 w-5 rounded-sm flex items-center justify-center shrink-0 border ${currentCompany.id === company.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'}`}>
                            <span className="text-[10px] font-bold">{theme.initials}</span>
                          </div>
                          <span className="truncate flex-1">{company.display_name || company.legal_name}</span>
                          {currentCompany.id === company.id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Hide Button */}
            <button
              onClick={() => { setSidebarCollapsed(true); setSidebarOpen(false); }}
              className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors shrink-0 hidden lg:flex"
              title="Hide sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => {
            if (item.permission) {
              return hasPermission(item.permission);
            }
            if (item.children) {
              return item.children.some(child => !child.permission || hasPermission(child.permission));
            }
            return true;
          }).map((item) => {
            const active = item.children
              ? item.children.some(child => getFullActive(child.path))
              : getFullActive(item.path);

            if (item.children) {
              const visibleChildren = item.children.filter(child => !child.permission || hasPermission(child.permission));
              if (visibleChildren.length === 0) return null;

              return (
                <NavGroup
                  key={item.label}
                  item={{ ...item, children: visibleChildren }}
                  active={active}
                  onCloseSidebar={() => setSidebarOpen(false)}
                  currentCompany={currentCompany}
                  location={location}
                />
              );
            }

            const itemPath = `/${currentCompany.id}/${item.path}`;
            return (
              <Link
                key={item.path}
                to={itemPath}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-all duration-200 group
                  ${active
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
                style={active ? { color: `hsl(${currentTheme.primary})` } : {}}
              >
                <item.icon
                  className={`h-4 w-4 transition-colors`}
                  style={active ? { color: `hsl(${currentTheme.primary})` } : {}}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user?.is_root_user && (
          <div className="p-2 border-t border-border">
            <Link
              to="/admin/tasks"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground w-full rounded-md hover:bg-accent transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-colors duration-300">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-2 lg:px-4 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {/* Show Sidebar Button - Size matches Hide Button */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                title="Show sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-sm md:text-base font-semibold text-foreground tracking-tight ml-1">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <button className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full ring-2 ring-card" />
            </button>

            <div className="h-6 w-px bg-border hidden sm:block mx-1" />

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-accent transition-colors"
              >
                <div className="h-7 w-7 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm text-primary-foreground">
                  <span className="text-[10px] font-bold">{initials}</span>
                </div>
                <div className="hidden md:block text-left mr-1">
                  <span className="block text-[11px] font-semibold leading-none">{user?.name || 'User'}</span>
                </div>
                <ChevronDown className={`h-3 w-3 text-muted-foreground hidden sm:block transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>


              {isUserDropdownOpen &&
                createPortal(
                  <div
                    ref={dropdownRef}
                    className="fixed top-14 right-4 w-56 bg-popover border border-border rounded-md shadow-lg z-[9999] animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1">
                      <div className="px-2 py-2 border-b border-border mb-1">
                        <p className="text-xs font-semibold truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        ref={buttonRef}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? "Signing out…" : "Sign out"}</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-2 space-y-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;
