import React, { useEffect, useState } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { StudentAttendanceSummary } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { AttendancePieChart } from '../../components/charts/AttendancePieChart';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const StudentAttendance: React.FC = () => {
  const [summaries, setSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const data = await attendanceService.getAttendanceOverview();
        setSummaries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-xl" />
        <CardSkeleton />
      </div>
    );
  }

  let totalClasses = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  summaries.forEach((s) => {
    totalClasses += s.total_classes;
    totalPresent += s.present_count;
    totalAbsent += s.absent_count;
  });

  const overallPct = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Record</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track course session attendances and maintain the mandatory 75% minimum university threshold.
        </p>
      </div>

      {summaries.length === 0 ? (
        <EmptyState
          title="No Attendance Data Available"
          description="Attendances will show up here as professors record daily course sessions."
        />
      ) : (
        <>
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 flex flex-col justify-between">
              <CardHeader
                title="Cumulative Attendance"
                subtitle="Aggregated across all registered semester subjects"
                icon={<CalendarCheck className="w-5 h-5" />}
              />
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-bold text-slate-700">Overall Attendance Rate</span>
                    <span
                      className={`text-2xl font-extrabold font-mono ${
                        overallPct < 75 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {overallPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        overallPct < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, overallPct))}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Sessions</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{totalClasses}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase">Attended</p>
                    <p className="text-lg font-bold text-emerald-700 mt-0.5">{totalPresent}</p>
                  </div>
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <p className="text-[10px] font-semibold text-rose-600 uppercase">Missed</p>
                    <p className="text-lg font-bold text-rose-700 mt-0.5">{totalAbsent}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Present vs Absent" subtitle="Distribution chart" />
              <AttendancePieChart present={totalPresent} absent={totalAbsent} />
            </Card>
          </div>

          {/* Subject-Wise Attendance Breakdown */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Subject Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {summaries.map((item) => (
                <Card key={item.course_id} className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {item.course_code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{item.course_name}</h3>
                    </div>
                    {item.is_low_attendance ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Below 75%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Eligible
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1.5 text-xs font-semibold">
                      <span className="text-slate-500">
                        {item.present_count} of {item.total_classes} classes attended
                      </span>
                      <span className={item.is_low_attendance ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.is_low_attendance ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                      />
                    </div>
                  </div>

                  {/* Session Logs History */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Sessions</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {item.history.length === 0 ? (
                        <p className="text-xs text-slate-400">No session records yet</p>
                      ) : (
                        item.history.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                          >
                            <span className="text-slate-700">{formatDate(log.date)}</span>
                            {log.status === 'present' ? (
                              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </span>
                            ) : (
                              <span className="font-semibold text-rose-600 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Absent
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
