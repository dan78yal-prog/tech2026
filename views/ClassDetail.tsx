
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Star, BrainCircuit, X, TrendingDown, TrendingUp, Minus, AlertTriangle, ChevronRight, Users, Trash2 } from 'lucide-react';
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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName + Math.random()}`,
      grades: [],
      performanceTrend: 'stable'
    };
    updateStore({ ...classRoom, students: [...classRoom.students, newStudent] });
    addNotification('طالب جديد', `تمت إضافة الطالب ${studentName} إلى الفصل.`, 'info');
    setStudentName('');
    setIsAddingStudent(false);
  };

  const deleteStudent = (studentId: string) => {
    if (!classRoom || !confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    const updatedStudents = classRoom.students.filter(s => s.id !== studentId);
    updateStore({ ...classRoom, students: updatedStudents });
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
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (newGrades.length >= 2) {
            trend = newGrade.score > newGrades[1].score ? 'up' : newGrade.score < newGrades[1].score ? 'down' : 'stable';
        }
        if (gradingScore < 5) {
            addNotification('تنبيه أداء منخفض', `الطالب ${s.name} سجل درجة متدنية (${gradingScore}/10).`, 'warning');
        }
        return { ...s, grades: newGrades, performanceTrend: trend };
      }
      return s;
    });

    updateStore({ ...classRoom, students: updatedStudents });
    setSelectedStudent(null);
    setGradingComment('');
  };

  if (!classRoom) return <div className="p-20 text-center font-bold text-indigo-600">جاري التحميل...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:bg-gray-50">
                <ChevronRight className="w-6 h-6 text-indigo-600" />
            </button>
            <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{classRoom.name}</h2>
                <p className="text-gray-400 font-bold text-sm">{classRoom.subject}</p>
            </div>
        </div>
        <button
          onClick={() => setIsAddingStudent(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">إضافة طالب</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classRoom.students.map((student) => {
          const avg = student.grades.length > 0 
              ? (student.grades.reduce((acc, curr) => acc + curr.score, 0) / student.grades.length).toFixed(1)
              : 0;

          return (
            <div key={student.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                 <div className="relative">
                      <img src={student.avatar} className="w-16 h-16 rounded-2xl bg-indigo-50" />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-md ${
                          student.performanceTrend === 'up' ? 'bg-emerald-500' : student.performanceTrend === 'down' ? 'bg-rose-500' : 'bg-blue-500'
                      }`}>
                          {student.performanceTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : student.performanceTrend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </div>
                 </div>
                 <button onClick={() => deleteStudent(student.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              
              <h4 className="font-black text-gray-800 text-lg mb-1 truncate">{student.name}</h4>
              <p className="text-sm font-bold text-gray-400 mb-6">المتوسط الأكاديمي: {avg}</p>
              
              <div className="flex gap-2">
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
        })}
      </div>

      {/* Grading Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-6 left-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="flex items-center gap-4 mb-8">
                <img src={selectedStudent.avatar} className="w-16 h-16 rounded-2xl" />
                <div>
                    <h2 className="text-2xl font-black text-gray-800">{selectedStudent.name}</h2>
                    <p className="text-gray-400 font-bold text-sm">إدارة التقييم</p>
                </div>
            </div>

            {loadingAi ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-indigo-600 font-bold">جاري تحليل الأداء ذكياً...</p>
              </div>
            ) : aiSummary ? (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
                <div className="p-6 rounded-3xl bg-fuchsia-50 border border-fuchsia-100">
                    <div className="flex items-center gap-2 mb-4 font-black text-fuchsia-700">
                        <BrainCircuit className="w-6 h-6" /> {aiSummary.status}
                    </div>
                    <p className="text-gray-700 font-bold mb-4">{aiSummary.summary}</p>
                    <div className="bg-white p-4 rounded-xl text-sm italic text-gray-600 border border-fuchsia-200">
                        💡 {aiSummary.advice}
                    </div>
                </div>
                <button onClick={() => setAiSummary(null)} className="w-full py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">رجوع</button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['participation', 'homework', 'exam', 'behavior'] as GradeType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setGradingType(type)}
                        className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all ${
                          gradingType === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-50 text-gray-400'
                        }`}
                      >
                        {type === 'participation' ? 'مشاركة' : type === 'homework' ? 'واجب' : type === 'exam' ? 'اختبار' : 'سلوك'}
                      </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-black text-gray-600">الدرجة (1-10)</label>
                        <span className="text-3xl font-black text-indigo-600">{gradingScore}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={gradingScore}
                        onChange={(e) => setGradingScore(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                    />
                </div>

                <button onClick={addGrade} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:bg-indigo-700">
                  حفظ التقييم
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
