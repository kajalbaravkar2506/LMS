import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface AttendancePieChartProps {
  present: number;
  absent: number;
}

export const AttendancePieChart: React.FC<AttendancePieChartProps> = ({ present, absent }) => {
  const total = present + absent;
  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No attendance sessions conducted yet
      </div>
    );
  }

  const data = [
    { name: 'Present Sessions', value: present, color: '#10b981' },
    { name: 'Absent Sessions', value: absent, color: '#f43f5e' },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
