'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SIDEBAR_MAIN_MENU, SIDEBAR_CONTROL_CENTER } from '@/lib/constants';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  MessageSquare,
  UserCog,
  Cable,
  Megaphone,
  MessageCircle,
  Phone,
  Settings,
  Code,
  Building2,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

/* Icon lookup map so we can render icons from string names in constants */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Sparkles,
  Users,
  MessageSquare,
  UserCog,
  Cable,
  Megaphone,
  MessageCircle,
  Phone,
  Settings,
  Code,
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-ge-border hover:bg-gray-50"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-ge-text" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-[250px] bg-ge-sidebar-bg border-r border-ge-border',
          'flex flex-col overflow-y-auto',
          /* Mobile: slide in/out */
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-200 ease-in-out',
          className
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ge-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-base font-semibold text-ge-text tracking-tight">
              GrowEasy
            </span>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4 text-ge-text-muted" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mt-3 mb-4 p-3 rounded-xl bg-ge-bg border border-ge-border-light">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ge-green-light flex items-center justify-center">
              <span className="text-ge-green font-semibold text-xs">VK</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ge-text truncate">VK Test</p>
              <p className="text-[11px] text-ge-text-muted uppercase tracking-wide font-medium">
                Owner
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-ge-text-muted shrink-0" />
          </div>
        </div>

        {/* Main menu */}
        <nav className="flex-1 px-3">
          <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ge-text-muted">
            Main
          </p>
          <ul className="space-y-0.5">
            {SIDEBAR_MAIN_MENU.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-ge-sidebar-active text-ge-green'
                        : 'text-ge-text-secondary hover:bg-ge-sidebar-hover hover:text-ge-text'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          isActive ? 'text-ge-green' : 'text-ge-text-muted'
                        )}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Control Center */}
          <p className="px-2 mt-6 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ge-text-muted">
            Control Center
          </p>
          <ul className="space-y-0.5">
            {SIDEBAR_CONTROL_CENTER.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-ge-sidebar-active text-ge-green'
                        : 'text-ge-text-secondary hover:bg-ge-sidebar-hover hover:text-ge-text'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          isActive ? 'text-ge-green' : 'text-ge-text-muted'
                        )}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom — Business Center */}
        <div className="px-3 py-4 border-t border-ge-border-light">
          <Link
            href="/business-center"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-ge-text-secondary hover:bg-ge-sidebar-hover hover:text-ge-text"
          >
            <Building2 className="h-[18px] w-[18px] text-ge-text-muted" />
            Business Center
          </Link>
        </div>
      </aside>
    </>
  );
}
