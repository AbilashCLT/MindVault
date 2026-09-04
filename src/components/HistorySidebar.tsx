import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Trash2,
  Calendar,
  MessageSquare,
  Sparkles,
  Filter,
  Plus,
  Compass,
  Lightbulb,
  FileText,
  ListTodo,
  Microscope,
  ChevronRight,
  X
} from 'lucide-react';
import type { ReflectionEntry, ReflectionMode } from '../types';

interface HistorySidebarProps {
  entries: ReflectionEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: ReflectionEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onToggleStar: (entry: ReflectionEntry) => Promise<void>;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onToggleStar,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterMode, setSelectedFilterMode] = useState<string>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.summary.toLowerCase().includes(query) ||
        entry.tags.some((t) => t.toLowerCase().includes(query)) ||
        entry.messages.some((m) => m.text.toLowerCase().includes(query));

      // Mode filter
      const matchMode =
        selectedFilterMode === 'all' || entry.mode === selectedFilterMode;

      // Star filter
      const matchStar = !onlyStarred || Boolean(entry.starred);

      return matchSearch && matchMode && matchStar;
    });
  }, [entries, searchQuery, selectedFilterMode, onlyStarred]);

  const getModeBadge = (mode: ReflectionMode) => {
    switch (mode) {
      case 'reflection':
        return {
          label: 'Reflect',
          bg: 'bg-[#C0A080]/15 text-[#D4B996] border-[#C0A080]/30',
          icon: Compass,
        };
      case 'brainstorm':
        return {
          label: 'Brainstorm',
          bg: 'bg-[#D97706]/15 text-[#FBBF24] border-[#D97706]/30',
          icon: Lightbulb,
        };
      case 'summary':
        return {
          label: 'Summary',
          bg: 'bg-[#0D9488]/15 text-[#2DD4BF] border-[#0D9488]/30',
          icon: FileText,
        };
      case 'action_plan':
        return {
          label: 'Action Plan',
          bg: 'bg-[#059669]/15 text-[#34D399] border-[#059669]/30',
          icon: ListTodo,
        };
      case 'deep_dive':
        return {
          label: 'Deep Dive',
          bg: 'bg-[#9333EA]/15 text-[#C084FC] border-[#9333EA]/30',
          icon: Microscope,
        };
      default:
        return {
          label: 'Reflect',
          bg: 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]',
          icon: Sparkles,
        };
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-80 sm:w-88 bg-[#0B0D14] border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Action */}
        <div className="p-4 border-b border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F9FAFB] text-sm tracking-wide font-serif">
                Sanctuary Vault
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#161826] text-[#A78BFA] font-medium border border-white/[0.08]">
                {entries.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="sidebar-new-entry-btn"
                onClick={() => {
                  onNewEntry();
                  onCloseMobile();
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white text-xs font-semibold transition-all shadow-md animate-sanctuary-breathe cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>New</span>
              </button>

              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#F9FAFB] lg:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
            <input
              id="history-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sanctuary thoughts or tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#11131C] border border-white/[0.08] text-xs text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#6B7280] hover:text-[#F9FAFB] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium cursor-pointer ${
                selectedFilterMode === 'all'
                  ? 'bg-[#181A28] text-[#F9FAFB] border border-[#8B5CF6]/40'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium cursor-pointer ${
                onlyStarred
                  ? 'bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/50'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              <Star className="w-3 h-3 fill-current text-[#A78BFA]" />
              <span>Starred</span>
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-[#6B7280] space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-[#4B5563] opacity-60" />
              <p className="text-xs font-medium text-[#9CA3AF]">No reflections found</p>
              <p className="text-[11px] text-[#6B7280]">
                {searchQuery
                  ? 'Try modifying your search or filter criteria'
                  : 'Start your first mindful sanctuary reflection!'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isSelected = entry.id === selectedEntryId;
              const badge = getModeBadge(entry.mode);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={entry.id}
                  id={`history-entry-item-${entry.id}`}
                  onClick={() => {
                    onSelectEntry(entry);
                    onCloseMobile();
                  }}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-[#181A28] border-[#8B5CF6]/60 shadow-lg shadow-black/40'
                      : 'bg-[#11131C]/60 border-white/[0.08] hover:bg-[#181A28]/70 hover:border-white/[0.15]'
                  }`}
                >
                  {/* Top row: badge + date + star */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.bg}`}
                    >
                      <BadgeIcon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#6B7280]">
                        {formatDate(entry.updatedAt || entry.createdAt)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(entry);
                        }}
                        title={entry.starred ? 'Unstar' : 'Star'}
                        className={`p-1 rounded hover:bg-[#1F2233] transition-colors cursor-pointer ${
                          entry.starred
                            ? 'text-[#A78BFA]'
                            : 'text-[#6B7280] opacity-0 group-hover:opacity-100 hover:text-[#A78BFA]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${entry.starred ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(entry.id);
                        }}
                        title="Delete entry"
                        className="p-1 rounded text-[#6B7280] opacity-0 group-hover:opacity-100 hover:text-[#FB7185] hover:bg-[#1F2233] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-[#F9FAFB]' : 'text-[#E5E7EB] group-hover:text-[#F9FAFB]'
                    }`}
                  >
                    {entry.title || 'Untitled Reflection'}
                  </h4>

                  {/* Summary Snippet */}
                  <p className="text-[11px] text-[#9CA3AF] line-clamp-2 mt-1 leading-snug">
                    {entry.summary || (entry.messages[0]?.text ?? 'No thoughts recorded yet...')}
                  </p>

                  {/* Bottom details: Message count + tags */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.08] text-[10px] text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#6B7280]" />
                      <span>{entry.messages.length} messages</span>
                    </span>

                    {entry.tags && entry.tags.length > 0 && (
                      <span className="text-[#A78BFA] truncate max-w-[120px]">
                        #{entry.tags.slice(0, 2).join(' #')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 bg-[#090A0F]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#11131C] border border-white/[0.08] p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-left">
              <div className="flex items-center gap-3 text-[#FB7185]">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Delete Reflection Entry?</h3>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                This will permanently remove this reflection from your isolated Cloud Firestore vault.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#E5E7EB] hover:bg-[#181A28] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const id = deletingId;
                    setDeletingId(null);
                    if (id) await onDeleteEntry(id);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-md shadow-red-950/30 transition-colors cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
