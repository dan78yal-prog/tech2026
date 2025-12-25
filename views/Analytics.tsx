
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ClassRoom } from '../types';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('teacher_classes');
    if (saved) {
      const classes: ClassRoom[] = JSON.parse(saved);
      const chartData = classes.map(c => ({
        name: c.name,
        avg: c.students.length > 0 ? c.students.reduce((acc, s) => {
            const sAvg = s.grades.length > 0 ? s.grades.reduce((a, g) => a + g.score, 0) / s.grades.length : 0;
            return acc + sAvg;
        }, 0) / c.students.length : 0
      }));
      setData(chartData);

      // Simple counts for pie
      const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
      setPieData([
        { name: 'الفصول', value: classes.length },
        { name: 'الطلاب', value: totalStudents }
      ]);
    }
  }, []);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">إحصائيات الأداء 📊</h2>
        <p className="text-gray-500">تحليل لمستوى الفصول الدراسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6">متوسط أداء الفصول</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="avg" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6">توزيع الطلاب والفصول</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">{pieData[1]?.value || 0}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">إجمالي الطلاب</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
