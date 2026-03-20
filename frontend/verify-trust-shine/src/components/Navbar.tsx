import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, Sun, Moon, LogOut, Building2, Briefcase } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const allNavItems = [
  { label: "Home", path: "/", roles: ["institution", "company", null] },
  { label: "Verify", path: "/verify", roles: ["institution", "company", null] },
  { label: "Institutions", path: "/institutions", roles: ["institution"] },
  { label: "Dashboard", path: "/dashboard", roles: ["institution"] },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { role, isLoggedIn, logout } = useAuth();

  // Filter nav items based on current role
  const navItems = allNavItems.filter(item =>
    item.roles.includes(role as any)
  );

  const handleLogout = () => {
    logout();
    navigate("/signin");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Cert<span className="text-accent">Verify</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Role badge */}
          {isLoggedIn && role && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground">
              {role === "institution" ? <Building2 className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
              <span className="capitalize">{role}</span>
            </span>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Auth buttons */}
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm font-medium border border-border px-4 py-2 rounded-md hover:bg-muted transition-colors text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/signin"
                className="text-sm font-medium bg-accent hover:opacity-90 text-accent-foreground px-4 py-2 rounded-md transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden animate-fade-in space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Sign In / Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
