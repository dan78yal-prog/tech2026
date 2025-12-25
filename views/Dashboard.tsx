
import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, ArrowLeft, BookOpen, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClassRoom, Student } from '../types';

const Dashboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('teacher_classes');
    if (saved) {
      const parsedClasses: ClassRoom[] = JSON.parse(saved);
      setClasses(parsedClasses);
      
      // تحليل الطلاب المعرضين للخطر (متوسط أقل من 5 من 10)
      const atRisk: any[] = [];
      parsedClasses.forEach(cls => {
        cls.students.forEach(student => {
           if (student.grades.length > 0) {
             const avg = student.grades.reduce((a, b) => a + b.score, 0) / student.grades.length;
             if (avg < 5) {
                atRisk.push({ ...student, className: cls.name, avg });
             }
           }
        });
      });
      setAtRiskStudents(atRisk.slice(0, 3));
    }
  }, []);

  const addClass = () => {
    if (!newClassName || !newSubject) return;
    const newClass: ClassRoom = {
      id: crypto.randomUUID(),
      name: newClassName,
      subject: newSubject,
      students: []
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem('teacher_classes', JSON.stringify(updated));
    
    // إرسال إشعار
    const newNotif = {
        id: crypto.randomUUID(),
        title: 'فصل جديد',
        message: `تمت إضافة فصل "${newClassName}" بنجاح.`,
        type: 'success',
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
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">مرحباً بك، أ. أحمد 👋</h2>
          <p className="text-gray-500 mt-1 font-medium">لديك {classes.length} فصول نشطة اليوم.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold hidden sm:inline">فصل جديد</span>
        </button>
      </header>

      {/* Quick Alert Section */}
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
                              <img src={student.avatar} className="w-10 h-10 rounded-full grayscale" />
                              <div>
                                  <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                  <p className="text-[10px] text-gray-500">{student.className}</p>
                              </div>
                          </div>
                          <div className="text-rose-600 font-black text-lg flex items-center gap-1">
                              {student.avg.toFixed(1)}
                              <TrendingDown className="w-4 h-4" />
                          </div>
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
             <p className="text-gray-400 mb-8 max-w-sm mx-auto">قم بإضافة أول فصل دراسي لك لتبدأ في تقييم طلابك ومتابعة تطورهم الأكاديمي.</p>
             <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100">إضافة أول فصل</button>
          </div>
        ) : (
          classes.map((cls) => (
            <Link
              key={cls.id}
              to={`/class/${cls.id}`}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:scale-150 group-hover:bg-indigo-100 duration-500 opacity-50" />
              <div className="relative z-10">
                <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                    <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">{cls.name}</h3>
                <p className="text-gray-400 font-medium mb-6">{cls.subject}</p>
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-3 rtl:space-x-reverse">
                        {cls.students.slice(0, 4).map(s => (
                            <img key={s.id} src={s.avatar} className="w-8 h-8 rounded-full border-2 border-white" />
                        ))}
                        {cls.students.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +{cls.students.length - 4}
                            </div>
                        )}
                    </div>
                    <span className="text-indigo-600 font-bold text-sm group-hover:gap-2 flex items-center transition-all">
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
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-gray-800 mb-8">إضافة فصل جديد</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 px-1">اسم الفصل الدراسي</label>
                <input
                  type="text"
                  placeholder="مثال: ثالث ثانوي - علمي"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 px-1">المادة التعليمية</label>
                <input
                  type="text"
                  placeholder="مثال: الرياضيات"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={addClass} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100">تأكيد</button>
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-lg">تراجع</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
