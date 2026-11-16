import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext.tsx';

export function Navbar() {
  const { language, setLanguage, t, cartCount, setCartDrawerOpen } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/shop', label: t.nav.shop },
    { to: '/track', label: t.nav.track },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 pb-0.5 border-b-2 ${
      isActive
        ? 'text-[#2E7D32] border-[#2E7D32]'
        : 'text-[#4E3B31] border-transparent hover:text-[#2E7D32] hover:border-[#2E7D32]/40'
    }`;

  return (
    <div className="sticky top-0 z-40">
      {/* Slim utility strip (<= 36px) with schedule, EN/SW toggle, and admin link */}
      <div className="bg-[#243B26] text-[#FFF8E7] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
          <p className="truncate text-[#E8F5E9]/90">{t.utilityBanner}</p>
          <div className="flex items-center gap-4 shrink-0">
            <div
              className="flex items-center gap-1 bg-white/10 rounded px-1 py-0.5"
              role="group"
              aria-label="Language switcher"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-[#FFF8E7] text-[#243B26]'
                    : 'text-[#FFF8E7]/85 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  language === 'sw'
                    ? 'bg-[#FFF8E7] text-[#243B26]'
                    : 'text-[#FFF8E7]/85 hover:text-white'
                }`}
              >
                SW
              </button>
            </div>
            <Link
              to="/admin"
              className="text-[11px] font-medium text-[#E3F2FD] hover:text-white underline-offset-2 hover:underline whitespace-nowrap shrink-0"
            >
              {t.adminPortal}
            </Link>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Top Bar */}
      <header className="bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#E6DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/"
            className="font-display text-base sm:text-xl font-bold tracking-tight text-[#2E7D32] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2E7D32] rounded"
          >
            CHEGOLAND Agri-Empire LTD
          </Link>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Primary action (Cart) + Mobile menu toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`${t.nav.cart} (${cartCount})`}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32]"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>{t.nav.cart}</span>
              <span className="tabular-nums font-mono text-xs bg-white/20 px-1.5 py-0.5 rounded">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E6DEC8] text-[#3E2723] hover:bg-[#F5EFE0] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[#E6DEC8] bg-[#FFFDF7] px-4 py-3 space-y-1"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-3 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : 'text-[#3E2723] hover:bg-[#F5EFE0]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
    </div>
  );
}
