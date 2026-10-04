export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatPercentage(value?: number | null): string {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(1)}%`;
}

export function formatMarks(marks?: number | null, maxMarks?: number | null): string {
  if (marks === null || marks === undefined) return '-';
  if (maxMarks) return `${Number(marks).toFixed(1)} / ${Number(maxMarks).toFixed(1)}`;
  return `${Number(marks).toFixed(1)}`;
}

export function getStatusBadgeVariant(status: string): { bg: string; text: string; border: string } {
  switch (status.toLowerCase()) {
    case 'active':
    case 'graded':
    case 'present':
    case 'completed':
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'submitted':
    case 'in_progress':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', border: 'border-blue-200' };
    case 'late':
    case 'dropped':
    case 'absent':
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', border: 'border-rose-200' };
    case 'pending':
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', border: 'border-amber-200' };
    default:
      return { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
