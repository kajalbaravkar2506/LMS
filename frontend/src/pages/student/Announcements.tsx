import React, { useEffect, useState } from 'react';
import { Megaphone, Search, User, Calendar, Globe, BookOpen } from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import { Announcement } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export const StudentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await announcementService.getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnnouncements();
  }, []);

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      (a.course_code && a.course_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Announcements & Bulletins</h1>
          <p className="text-xs text-slate-500 mt-1">Official university circulars and course notifications.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bulletins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Announcements Found"
          description="There are no announcements matching your search query."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => (
            <Card key={ann.id} className="hover:border-slate-300 transition">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {ann.is_global ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Campus Global
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {ann.course_code}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    {ann.course_name}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(ann.created_at)}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-sans">
                {ann.content}
              </p>

              <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-400 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Posted by {ann.creator_name || 'Academic Administration'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
