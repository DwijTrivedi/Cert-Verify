import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, Sun, Moon, LogOut, Building2, Briefcase } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const allNavItems = [
  { label: "Home",         path: "/",            roles: ["institution", "company", null] },
  { label: "Verify",       path: "/verify",       roles: ["institution", "company", null] },
  { label: "Institutions", path: "/institutions", roles: ["institution"] },
  { label: "Dashboard",    path: "/dashboard",    roles: ["institution"] },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { role, isLoggedIn, logout } = useAuth();

  const navItems = allNavItems.filter((item) =>
    item.roles.includes(role as any)
  );

  const handleLogout = () => {
    logout();
    navigate("/signin");
    setMobileOpen(false);
  };

  // Role-aware badge colors
  const roleBadgeClass =
    role === "institution"
      ? "border-[hsl(158_64%_42%/0.35)] bg-[hsl(158_64%_42%/0.1)] text-[hsl(158_64%_52%)]"
      : "border-[hsl(190_85%_48%/0.35)] bg-[hsl(190_85%_48%/0.1)] text-[hsl(190_85%_58%)]";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-card/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
            <Shield className="h-5 w-5 text-accent group-hover:text-accent transition-colors" />
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Cert<span className="text-accent">Verify</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Role badge */}
          {isLoggedIn && role && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${roleBadgeClass}`}
            >
              {role === "institution"
                ? <Building2 className="h-3 w-3" />
                : <Briefcase className="h-3 w-3" />
              }
              <span className="capitalize">{role}</span>
            </motion.span>
          )}

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Auth buttons */}
          {isLoggedIn ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:text-foreground border-border/60"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </motion.div>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm font-medium border border-border/60 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/signin"
                  className="text-sm font-medium bg-accent hover:opacity-90 text-accent-foreground px-4 py-2 rounded-lg transition-opacity"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-border/60 bg-card flex items-center justify-center text-muted-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground w-9 h-9 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="border-t border-border/40 bg-card/95 backdrop-blur-xl md:hidden overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-border/40 space-y-2">
                {/* Role badge (mobile) */}
                {isLoggedIn && role && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${roleBadgeClass}`}>
                    {role === "institution" ? <Building2 className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                    <span className="capitalize">{role}</span>
                  </span>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    Sign In / Get Started
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
