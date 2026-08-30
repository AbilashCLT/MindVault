import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  PlusCircle,
  User as UserIcon,
  Home,
  PenTool,
  Search,
  Brain,
  Crown,
  Lock,
  Target,
  Calendar,
  Settings,
} from 'lucide-react';
import type { UserProfile, AppView } from '../types';
import { isUserAdmin } from '../lib/firebase';

interface NavbarProps {
  user: UserProfile | null;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNewEntry: () => void;
  onSignOut: () => void;
  isPrivateSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onNewEntry,
  onSignOut,
  isPrivateSession,
}) => {
  const isAdmin = isUserAdmin(user);

  const navItems: Array<{ id: AppView; label: string; icon: any; adminOnly?: boolean }> = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'reflect', label: 'Reflect', icon: PenTool },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'memory', label: 'AI Memory', icon: Brain },
    { id: 'ask', label: 'Ask Vault', icon: Search },
    { id: 'patterns', label: 'Patterns', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin Console', icon: Crown, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#27272A] text-[#F4F4F5]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E2822] via-[#1C1A17] to-[#121214] border border-[#C0A080]/40 flex items-center justify-center shadow-lg shadow-black/40">
            <Sparkles className="w-4 h-4 text-[#C0A080]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base md:text-lg tracking-tight text-[#F4F4F5]">
                Lumina Vault
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#C0A080]/15 text-[#D4B996] border border-[#C0A080]/30 hidden sm:inline-block">
                Gemini 3.6 Flash
              </span>
            </div>
          </div>
        </div>

        {/* Center Primary Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#27272A]">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold shadow-sm'
                      : item.adminOnly
                      ? 'text-[#F59E0B] hover:bg-[#18181B]'
                      : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#18181B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Right Section: Ephemeral status + New Reflection + User Profile */}
        <div className="flex items-center gap-3">
          {isPrivateSession && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#064E3B]/40 border border-[#059669]/50 text-[11px] text-[#34D399]">
              <Lock className="w-3 h-3 text-[#34D399]" />
              <span>Zero-Disk Active</span>
            </div>
          )}

          {user && (
            <>
              <button
                id="navbar-new-entry-btn"
                onClick={onNewEntry}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-semibold transition-all shadow-md shadow-[#C0A080]/15 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#0A0A0B]" />
                <span className="hidden sm:inline">New Thought</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-[#27272A]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-1 ring-[#C0A080]/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center text-[#A1A1AA] border border-[#27272A]">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="hidden xl:block text-left text-xs">
                  <p className="font-semibold text-[#F4F4F5] truncate max-w-[110px]">
                    {user.displayName || 'Vault Owner'}
                  </p>
                  <p className="text-[10px] text-[#A1A1AA] truncate max-w-[110px]">
                    {user.email || 'Private Identity'}
                  </p>
                </div>

                <button
                  id="navbar-signout-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FB7185] hover:bg-[#18181B] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 bg-[#121214] border-t border-[#27272A] overflow-x-auto">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#C0A080] font-bold'
                    : item.adminOnly
                    ? 'text-[#F59E0B]'
                    : 'text-[#71717A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
      </div>
    </header>
  );
};
