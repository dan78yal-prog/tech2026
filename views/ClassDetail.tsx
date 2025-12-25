
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Added 'Users' to the lucide-react imports to resolve the "Cannot find name 'Users'" error on line 135
import { UserPlus, Star, Trash2, BrainCircuit, X, TrendingDown, TrendingUp, Minus, AlertTriangle, ChevronLeft, Users } from 'lucide-react';
import { ClassRoom, Student, GradeType, AppNotification } from '../types';
import { getStudentSummary } from '../services/geminiService';

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classRoom, setClassRoom] = useState<ClassRoom | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentName, setStudentName] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradingType, setGradingType] = useState<GradeType>('participation');
  const [gradingScore, setGradingScore] = useState(5);
  const [gradingComment, setGradingComment] = useState('');
  
  const [aiSummary, setAiSummary] = useState<{status: string, summary: string, advice: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('teacher_classes');
    if (saved) {
      const classes: ClassRoom[] = JSON.parse(saved);
      const found = classes.find((c) => c.id === id);
      if (found) setClassRoom(found);
    }
  }, [id]);

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif: AppNotification = {
        id: crypto.randomUUID(),
        title,
        message,
        type,
        date: new Date().toLocaleTimeString('ar-SA'),
        read: false
    };
    const existing = JSON.parse(localStorage.getItem('teacher_notifications') || '[]');
    localStorage.setItem('teacher_notifications', JSON.stringify([...existing, newNotif]));
    window.dispatchEvent(new Event('storage'));
  };

  const updateStore = (updatedClass: ClassRoom) => {
    const saved = localStorage.getItem('teacher_classes');
    if (saved) {
      const classes: ClassRoom[] = JSON.parse(saved);
      const updated = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
      localStorage.setItem('teacher_classes', JSON.stringify(updated));
    }
    setClassRoom(updatedClass);
  };

  const addStudent = () => {
    if (!studentName || !classRoom) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: studentName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`,
      grades: [],
      performanceTrend: 'stable'
    };
    updateStore({ ...classRoom, students: [...classRoom.students, newStudent] });
    addNotification('طالب جديد', `تمت إضافة الطالب ${studentName} إلى الفصل.`, 'info');
    setStudentName('');
    setIsAddingStudent(false);
  };

  const addGrade = () => {
    if (!selectedStudent || !classRoom) return;
    const newGrade = {
      id: crypto.randomUUID(),
      type: gradingType,
      score: gradingScore,
      date: new Date().toLocaleDateString('ar-SA'),
      comment: gradingComment
    };

    const updatedStudents = classRoom.students.map(s => {
      if (s.id === selectedStudent.id) {
        const newGrades = [newGrade, ...s.grades];
        // حساب اتجاه الأداء البسيط
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (newGrades.length >= 2) {
            trend = newGrade.score > newGrades[1].score ? 'up' : newGrade.score < newGrades[1].score ? 'down' : 'stable';
        }
        
        // تنبيه إذا كانت الدرجة منخفضة جداً
        if (gradingScore < 5) {
            addNotification('تنبيه أداء منخفض', `الطالب ${s.name} سجل درجة متدنية (${gradingScore}/10) في ${gradingType}.`, 'warning');
        }

        return { ...s, grades: newGrades, performanceTrend: trend };
      }
      return s;
    });

    updateStore({ ...classRoom, students: updatedStudents });
    setSelectedStudent(null);
    setGradingComment('');
  };

  if (!classRoom) return <div className="p-20 text-center font-bold text-indigo-600 animate-pulse">جاري تحميل الفصل...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all">
                <ChevronLeft className="w-6 h-6 text-gray-400 rotate-180" />
            </button>
            <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{classRoom.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-gray-400 font-bold text-sm">{classRoom.subject}</p>
                </div>
            </div>
        </div>
        <button
          onClick={() => setIsAddingStudent(true)}
          className="bg-indigo-600 text-white w-12 h-12 sm:w-auto sm:px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">إضافة طالب</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classRoom.students.length === 0 ? (
          <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">لا يوجد طلاب مسجلين في هذا الفصل حالياً.</p>
          </div>
        ) : (
          classRoom.students.map((student) => {
            const avg = student.grades.length > 0 
                ? (student.grades.reduce((acc, curr) => acc + curr.score, 0) / student.grades.length).toFixed(1)
                : 0;

            return (
              <div key={student.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-6">
                   <div className="relative">
                        <img src={student.avatar} className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-sm" />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-lg ${
                            student.performanceTrend === 'up' ? 'bg-emerald-500' : student.performanceTrend === 'down' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}>
                            {student.performanceTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : student.performanceTrend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        </div>
                   </div>
                   <div className="text-left">
                        <div className="text-2xl font-black text-gray-800">{avg}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المتوسط</div>
                   </div>
                </div>
                
                <h4 className="font-black text-gray-800 text-lg mb-6 truncate">{student.name}</h4>
                
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => { setSelectedStudent(student); setAiSummary(null); }}
                    className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" /> تقييم
                  </button>
                  <button
                    onClick={() => { setSelectedStudent(student); setLoadingAi(true); getStudentSummary(student).then(res => { setAiSummary(res); setLoadingAi(false); }); }}
                    className="flex-1 py-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl font-bold hover:bg-fuchsia-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <BrainCircuit className="w-4 h-4" /> ذكاء
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Student Modal */}
      {isAddingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 animate-in zoom-in-95">
            <h2 className="text-3xl font-black text-gray-800 mb-8">إضافة طالب</h2>
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-500 outline-none mb-6 font-bold"
            />
            <div className="flex gap-4">
              <button onClick={addStudent} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100">إضافة</button>
              <button onClick={() => setIsAddingStudent(false)} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-lg">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Grading & AI Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-6 left-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
                <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="flex items-center gap-4 mb-8">
                <img src={selectedStudent.avatar} className="w-16 h-16 rounded-2xl shadow-sm" />
                <div>
                    <h2 className="text-2xl font-black text-gray-800">{selectedStudent.name}</h2>
                    <p className="text-gray-400 font-bold text-sm">إدارة السجل الدراسي والتقييم الذكي</p>
                </div>
            </div>

            {loadingAi ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl"></div>
                <p className="text-indigo-600 font-black text-xl animate-pulse">جاري تحليل الأداء...</p>
              </div>
            ) : aiSummary ? (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-6">
                <div className={`p-6 rounded-3xl border ${aiSummary.status.includes('ممتاز') ? 'bg-emerald-50 border-emerald-100' : 'bg-fuchsia-50 border-fuchsia-100'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <BrainCircuit className="w-6 h-6 text-fuchsia-600" />
                        <span className="font-black text-gray-800">تحليل الذكاء الاصطناعي</span>
                        <span className={`mr-auto px-4 py-1 rounded-full text-xs font-bold ${aiSummary.status.includes('ممتاز') ? 'bg-emerald-200 text-emerald-700' : 'bg-fuchsia-200 text-fuchsia-700'}`}>
                            {aiSummary.status}
                        </span>
                    </div>
                    <p className="text-gray-700 font-bold leading-relaxed mb-6">{aiSummary.summary}</p>
                    <div className="bg-white/60 p-5 rounded-2xl border border-white/40">
                        <p className="text-sm italic text-gray-600 leading-relaxed font-medium">💡 {aiSummary.advice}</p>
                    </div>
                </div>
                <button onClick={() => setAiSummary(null)} className="w-full py-4 bg-gray-100 rounded-2xl font-black text-gray-500">العودة للتقييم اليدوي</button>
              </div>
            ) : (
              <div className="space-y-8 mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['participation', 'homework', 'exam', 'behavior'] as GradeType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setGradingType(type)}
                        className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-widest ${
                          gradingType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-gray-50 text-gray-400 hover:border-indigo-50'
                        }`}
                      >
                        {type === 'participation' ? 'مشاركة' : type === 'homework' ? 'واجب' : type === 'exam' ? 'اختبار' : 'سلوك'}
                      </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-sm font-black text-gray-600 uppercase">الدرجة المستحقة</label>
                        <span className="text-3xl font-black text-indigo-600 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center">{gradingScore}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={gradingScore}
                        onChange={(e) => setGradingScore(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-2 bg-gray-100 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-gray-600 px-1 uppercase">ملاحظات إضافية</label>
                    <textarea 
                        value={gradingComment}
                        onChange={(e) => setGradingComment(e.target.value)}
                        placeholder="اكتب تعليقاً للمعلم أو ولي الأمر..."
                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold min-h-[100px]"
                    />
                </div>

                <button onClick={addGrade} className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  <Star className="w-6 h-6 fill-white" /> حفظ التقييم
                </button>
              </div>
            )}

            <div className="border-t-2 border-dashed border-gray-100 pt-8">
                <h3 className="font-black text-gray-800 text-lg mb-6 flex items-center gap-2">
                    سجل التقييمات الحديثة
                    {selectedStudent.performanceTrend === 'down' && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
                </h3>
                <div className="space-y-4">
                    {selectedStudent.grades.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-[1.5rem] border-2 border-dashed border-gray-100 text-gray-400 font-bold">لا يوجد تاريخ تقييم حالياً</div>
                    ) : (
                        selectedStudent.grades.slice(0, 5).map((grade) => (
                            <div key={grade.id} className="group relative bg-white border border-gray-50 p-4 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-all shadow-sm">
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit mb-1 ${
                                        grade.score >= 8 ? 'bg-emerald-50 text-emerald-600' : grade.score >= 5 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {grade.type === 'participation' ? 'مشاركة' : grade.type === 'homework' ? 'واجب' : grade.type === 'exam' ? 'اختبار' : 'سلوك'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold">{grade.date}</span>
                                    {grade.comment && <p className="text-xs text-gray-500 mt-2 font-medium italic">"{grade.comment}"</p>}
                                </div>
                                <div className="text-2xl font-black text-gray-800">{grade.score}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
