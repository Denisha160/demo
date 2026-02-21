import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
    Settings, LogOut, Menu, ChevronDown,
    Bell, PanelLeftClose, PanelLeft, CheckSquare, Inbox, Building2, ShieldCheck
} from "lucide-react";

interface AdminLayoutProps {
    title?: string;
}

const navItems = [
    { label: "Inbox", icon: Inbox, path: "/admin/inbox" },
    { label: "Tasks", icon: CheckSquare, path: "/admin/tasks" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const AdminLayout = ({ title }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const activeNavItem = navItems.find(item => location.pathname === item.path);
    const pageTitle = title || activeNavItem?.label || "Admin";

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 border-r border-slate-800
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        ${sidebarCollapsed ? "lg:w-0 lg:border-r-0 lg:overflow-hidden lg:-translate-x-full" : "lg:w-56 lg:translate-x-0"}
        w-56
      `}>
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-white tracking-tight">Admin Portal</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 group
                  ${active
                                        ? "bg-primary text-white font-medium"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }
                `}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}

                    <div className="pt-4 pb-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</div>
                    <Link
                        to="/company-selection"
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <Building2 className="h-4 w-4" />
                        Switch to Company
                    </Link>
                </nav>

                <div className="p-2 border-t border-slate-800">
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white w-full rounded-md hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-base font-semibold text-slate-900 tracking-tight">{pageTitle}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-slate-200">System Admin</span>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-slate-100 transition-colors"
                            >
                                <div className="h-7 w-7 bg-slate-900 rounded-full flex items-center justify-center text-white">
                                    <span className="text-[10px] font-bold">AD</span>
                                </div>
                                <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isUserDropdownOpen && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-1">
                                    <button
                                        onClick={() => { navigate("/login"); setIsUserDropdownOpen(false); }}
                                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm text-destructive hover:bg-destructive/5 transition-colors text-left"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
