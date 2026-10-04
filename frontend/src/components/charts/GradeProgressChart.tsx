import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface GradeProgressChartProps {
  data: {
    course_code: string;
    course_name: string;
    grade_percentage: number;
    attendance_percentage?: number;
  }[];
}

export const GradeProgressChart: React.FC<GradeProgressChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No performance records to display yet
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="course_code"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar
            name="Assignment Grade %"
            dataKey="grade_percentage"
            fill="#4f46e5"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          {data[0]?.attendance_percentage !== undefined && (
            <Bar
              name="Attendance %"
              dataKey="attendance_percentage"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
