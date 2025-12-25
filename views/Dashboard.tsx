
import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, ArrowLeft, BookOpen, AlertCircle, TrendingDown, TrendingUp, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClassRoom, Student } from '../types';

const Dashboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const saved = localStorage.getItem('teacher_classes');
      if (saved) {
        const parsedClasses: ClassRoom[] = JSON.parse(saved);
        setClasses(parsedClasses);
        
        const risk: any[] = [];
        parsedClasses.forEach(cls => {
          cls.students.forEach(student => {
             if (student.grades.length > 0) {
               const avg = student.grades.reduce((a, b) => a + b.score, 0) / student.grades.length;
               if (avg < 5) risk.push({ ...student, className: cls.name, avg });
             }
          });
        });
        setAtRiskStudents(risk.slice(0, 3));
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  };

  const fillDemoData = () => {
    const demo: ClassRoom[] = [
      {
        id: 'demo-1',
        name: 'الفصل التجريبي أ',
        subject: 'اللغة العربية',
        students: [
          { id: 's1', name: 'أحمد محمد', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed', grades: [], performanceTrend: 'stable' },
          { id: 's2', name: 'سارة خالد', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', grades: [], performanceTrend: 'stable' }
        ]
      }
    ];
    localStorage.setItem('teacher_classes', JSON.stringify(demo));
    setClasses(demo);
    window.location.reload();
  };

  const addClass = () => {
    if (!newClassName || !newSubject) return;
    const newClass: ClassRoom = {
      id: Date.now().toString(), // fallback if crypto fails
      name: newClassName,
      subject: newSubject,
      students: []
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem('teacher_classes', JSON.stringify(updated));
    
    const newNotif = {
        id: Date.now().toString(),
        title: 'فصل جديد',
        message: `تمت إضافة فصل "${newClassName}" بنجاح.`,
        type: 'success' as const,
        date: new Date().toLocaleTimeString('ar-SA'),
        read: false
    };
    const existingNotifs = JSON.parse(localStorage.getItem('teacher_notifications') || '[]');
    localStorage.setItem('teacher_notifications', JSON.stringify([...existingNotifs, newNotif]));
    window.dispatchEvent(new Event('storage'));

    setNewClassName('');
    setNewSubject('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">لوحة المتابعة 👋</h2>
          <p className="text-gray-500 mt-1 font-medium">لديك {classes.length} فصول حالياً.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold hidden sm:inline">فصل جديد</span>
        </button>
      </header>

      {atRiskStudents.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-rose-600 font-bold mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <h3>طلاب يحتاجون متابعة فورية</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {atRiskStudents.map(student => (
                      <div key={student.id} className="bg-white/60 p-4 rounded-2xl flex items-center justify-between border border-rose-200/50">
                          <div className="flex items-center gap-3">
                              <img src={student.avatar} className="w-10 h-10 rounded-full" />
                              <div>
                                  <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                  <p className="text-[10px] text-gray-500">{student.className}</p>
                              </div>
                          </div>
                          <div className="text-rose-600 font-black text-lg">{student.avg.toFixed(1)}</div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-16 text-center">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-12 h-12 text-indigo-600" />
             </div>
             <h3 className="text-2xl font-bold text-gray-800 mb-2">ابدأ رحلتك التعليمية</h3>
             <p className="text-gray-400 mb-8 max-w-sm mx-auto">قم بإضافة أول فصل دراسي لك لتبدأ في تقييم طلابك.</p>
             <div className="flex flex-col items-center gap-4">
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg">إضافة أول فصل</button>
                <button onClick={fillDemoData} className="text-indigo-600 text-sm font-bold flex items-center gap-2 hover:underline">
                    <Database className="w-4 h-4" /> تعبئة بيانات تجريبية للفحص
                </button>
             </div>
          </div>
        ) : (
          classes.map((cls) => (
            <Link
              key={cls.id}
              to={`/class/${cls.id}`}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6">
                    <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">{cls.name}</h3>
                <p className="text-gray-400 font-medium mb-6">{cls.subject}</p>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold text-sm">{cls.students.length} طلاب</span>
                    <span className="text-indigo-600 font-bold text-sm flex items-center">
                        دخول <ArrowLeft className="w-4 h-4 mr-2" />
                    </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black text-gray-800 mb-8">إضافة فصل جديد</h2>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="اسم الفصل الدراسي"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-bold"
              />
              <input
                type="text"
                placeholder="المادة التعليمية"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-bold"
              />
              <div className="flex gap-4 pt-6">
                <button onClick={addClass} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold">تأكيد</button>
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold">تراجع</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
