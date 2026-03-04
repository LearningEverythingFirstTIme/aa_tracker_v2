import { useEffect, useState } from 'react';
import { LayoutDashboard, Calendar, History, Wallet, LogOut, X, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';

interface NavigationProps {
  activeSection?: string;
  onNavigate?: (page: 'dashboard' | 'treasury') => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      setIsVisible(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which section is in the viewport
  useEffect(() => {
    const sectionIds = ['dashboard', 'meetings', 'history', 'treasury'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToSection = (sectionId: string) => {
    setShowMobileMenu(false);
    if (sectionId === 'treasury' && onNavigate) {
      onNavigate('treasury');
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setShowMobileMenu(false);
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
    { id: 'treasury', label: 'Treasury', icon: Wallet },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div
        className={`mx-4 mt-3 px-6 py-3 rounded-[10px] border-[3px] border-brutal-text transition-all duration-300 ${
          isScrolled ? 'bg-brutal-bg/95 backdrop-blur-sm shadow-brutal' : 'bg-brutal-bg/80 backdrop-blur-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('dashboard')}
            className="font-heading font-bold text-xl tracking-tight text-brutal-text hover:text-brutal-yellow transition-colors"
          >
            AA Tracker
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-brutal-yellow text-brutal-bg'
                      : 'text-brutal-text-secondary hover:text-brutal-text hover:bg-brutal-text/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* User & Logout */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-brutal-text/10">
              {user && (
                <span className="text-sm text-brutal-text-secondary truncate max-w-[160px]">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-brutal-text-secondary hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((v) => !v)}
            className="md:hidden p-2 text-brutal-text"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {showMobileMenu && (
          <nav className="md:hidden pt-3 border-t-2 border-brutal-text/10 mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all text-left ${
                    isActive
                      ? 'bg-brutal-yellow text-brutal-bg'
                      : 'text-brutal-text-secondary hover:text-brutal-text hover:bg-brutal-text/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-mono text-sm uppercase tracking-wider text-brutal-text-secondary hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
