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
  BookOpen,
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
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onNewEntry,
  onSignOut,
  isPrivateSession,
  onOpenGuide,
}) => {
  const isAdmin = isUserAdmin(user);

  const navItems: Array<{ id: AppView; label: string; icon: any; adminOnly?: boolean }> = [
    { id: 'home', label: 'Sanctuary', icon: Home },
    { id: 'reflect', label: 'Reflect', icon: PenTool },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'memory', label: 'AI Memory', icon: Brain },
    { id: 'ask', label: 'Vault Search', icon: Search },
    { id: 'patterns', label: 'Patterns', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin Console', icon: Crown, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B0D14]/85 backdrop-blur-xl border-b border-white/[0.08] text-[#F3F4F6]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand: MindVault */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E1B4B] via-[#17153B] to-[#0F172A] border border-[#8B5CF6]/30 flex items-center justify-center shadow-lg shadow-[#8B5CF6]/10 group-hover:border-[#A78BFA]/50 transition-all">
            <Sparkles className="w-4 h-4 text-[#A78BFA] group-hover:text-[#C4B5FD] transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-[#F9FAFB]">
                MindVault
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30 hidden sm:inline-block">
                Digital Sanctuary
              </span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] tracking-wide hidden lg:block -mt-0.5 font-sans">
              Your thoughts. Your space.
            </p>
          </div>
        </div>

        {/* Center Primary Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121420]/80 p-1 rounded-xl border border-white/[0.06] backdrop-blur-md">
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
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold shadow-md shadow-[#7C3AED]/25'
                      : item.adminOnly
                      ? 'text-[#F59E0B] hover:bg-white/[0.05]'
                      : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Right Section: Guide + Ephemeral status + New Reflection + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenGuide && (
            <button
              id="navbar-user-guide-btn"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1E1B4B]/80 hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-[#E0E7FF] text-xs font-semibold transition-all shadow-sm shadow-[#8B5CF6]/20 hover:border-[#A78BFA] cursor-pointer"
              title="Open User Guide & Manual"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span className="inline">User Guide</span>
            </button>
          )}

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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white text-xs font-semibold transition-all shadow-md shadow-[#7C3AED]/20 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">New Thought</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-1 ring-[#8B5CF6]/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#181A28] flex items-center justify-center text-[#C4B5FD] border border-white/[0.08]">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="hidden xl:block text-left text-xs">
                  <p className="font-semibold text-[#F3F4F6] truncate max-w-[110px]">
                    {user.displayName || 'Vault Owner'}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] truncate max-w-[110px]">
                    {user.email || 'Private Identity'}
                  </p>
                </div>

                <button
                  id="navbar-signout-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#FB7185] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 bg-[#0D0F18]/95 border-t border-white/[0.06] overflow-x-auto no-scrollbar gap-1">
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
                    ? 'text-[#C4B5FD] font-bold'
                    : item.adminOnly
                    ? 'text-[#F59E0B]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium text-[#A78BFA] hover:text-[#C4B5FD] transition-colors cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>Guide</span>
          </button>
        )}
      </div>
    </header>
  );
};
