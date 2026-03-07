import { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
    LogOut, Menu, ChevronDown,
    PanelLeftClose, PanelLeft, CheckSquare, Inbox, Building2, ShieldCheck, Users, Tags, Box, Archive
} from "lucide-react";
import { useLogout, useCurrentUser } from "@/hooks/useAuth";
import { createPortal } from 'react-dom';

interface AdminLayoutProps {
    title?: string;
}

const navItems = [
    { label: "Companies", icon: Building2, path: "/admin/companies" },
    { label: "Inbox", icon: Inbox, path: "/admin/inbox" },
    { label: "Tasks", icon: CheckSquare, path: "/admin/tasks" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Roles", icon: ShieldCheck, path: "/admin/roles" },
    { label: "Products", icon: Box, path: "/admin/products" },
    { label: "Packages", icon: Archive, path: "/admin/packages" },
    { label: "Categories", icon: Tags, path: "/admin/product-categories" },
];

// Admin theme - single consistent color
const ADMIN_PRIMARY = "221.2 83.2% 53.3%"; // Blue

const AdminLayout = ({ title }: AdminLayoutProps) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const { mutate: logout, isPending: isLoggingOut } = useLogout();
    const user = useCurrentUser();

    // Set admin theme on mount
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--primary", ADMIN_PRIMARY);
        root.style.setProperty("--ring", ADMIN_PRIMARY);
    }, []);

    // Derive initials from user name (e.g. "Admin" → "AD", "John Doe" → "JD")
    const initials = user?.name
        ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
        : 'AD';

    const activeNavItem = navItems.find(item =>
        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
    );
    const pageTitle = title || activeNavItem?.label || "Admin";

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
                        <div className="flex items-center gap-2 p-1.5 flex-1 min-w-0">
                            <div className="h-7 w-7 bg-primary rounded flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-foreground tracking-tight text-sm truncate">Admin Portal</span>
                        </div>

                        {/* Sidebar Hide Button */}
                        <button
                            onClick={() => { setSidebarCollapsed(true); setSidebarOpen(false); }}
                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors shrink-0 hidden lg:flex"
                            title="Hide sidebar"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                        flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-all duration-200 group
                                        ${active
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }
                                `}
                                style={active ? { color: `hsl(${ADMIN_PRIMARY})` } : {}}
                            >
                                <item.icon
                                    className="h-4 w-4 transition-colors"
                                    style={active ? { color: `hsl(${ADMIN_PRIMARY})` } : {}}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-border">
                    <button
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground hover:text-destructive w-full rounded-md hover:bg-destructive/10 transition-colors group"
                    >
                        <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                        {isLoggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-colors duration-300">
                <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-2 lg:px-4 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        {/* Show Sidebar Button */}
                        {sidebarCollapsed && (
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                                title="Show sidebar"
                            >
                                <PanelLeft className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-sm md:text-base font-semibold text-foreground tracking-tight ml-1">{pageTitle}</h1>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-3">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-primary/20">
                            System Admin
                        </span>

                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-accent transition-colors"
                            >
                                <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-sm text-primary-foreground">
                                    <span className="text-[10px] font-bold">{initials}</span>
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

export default AdminLayout;