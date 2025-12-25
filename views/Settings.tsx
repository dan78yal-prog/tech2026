
import React from 'react';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const clearAllData = () => {
    if (confirm('هل أنت متأكد من مسح جميع الفصول والطلاب والدرجات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      localStorage.removeItem('teacher_classes');
      localStorage.removeItem('teacher_notifications');
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">الإعدادات</h2>
        <p className="text-gray-500 font-bold">إدارة تفضيلات التطبيق والبيانات</p>
      </header>

      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-600 font-black">
            <ShieldCheck className="w-6 h-6" />
            <h3>خصوصية البيانات</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            يتم تخزين جميع بياناتك محلياً على متصفحك فقط. نحن لا نقوم برفع بيانات الطلاب إلى أي خوادم خارجية باستثناء معالجة الملخصات الذكية عبر خدمة Gemini.
          </p>
        </section>

        <section className="space-y-4 border-t border-gray-50 pt-8">
          <div className="flex items-center gap-3 text-rose-600 font-black">
            <AlertTriangle className="w-6 h-6" />
            <h3>منطقة الخطر</h3>
          </div>
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-800">مسح كافة البيانات</h4>
              <p className="text-xs text-gray-500">سيتم حذف جميع الفصول والطلاب والتقييمات المسجلة.</p>
            </div>
            <button 
              onClick={clearAllData}
              className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              حذف الكل
            </button>
          </div>
        </section>
      </div>

      <div className="text-center text-gray-400 text-xs font-bold">
        مُعلّم - إصدار 1.0.1
      </div>
    </div>
  );
};

export default Settings;
