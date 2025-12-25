
import React, { useState, useEffect } from 'react';
import { Home, Users, BarChart2, Bell, Settings, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AppNotification } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('teacher_notifications');
    if (saved) setNotifications(JSON.parse(saved));

    const handleStorageChange = () => {
      const updated = localStorage.getItem('teacher_notifications');
      if (updated) setNotifications(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/analytics', icon: BarChart2, label: 'الإحصائيات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('teacher_notifications', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pr-64 bg-slate-50/50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-full w-64 bg-white border-l border-gray-100 z-30 shadow-sm">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Users className="w-6 h-6" />
            </div>
            <span>مُعلّم</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all group ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={() => { setShowNotifPanel(true); markAsRead(); }}
             className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative"
           >
             <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-bold">الإشعارات</span>
             </div>
             {unreadCount > 0 && (
               <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                 {unreadCount}
               </span>
             )}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-indigo-600">مُعلّم</h1>
            <button onClick={() => { setShowNotifPanel(true); markAsRead(); }} className="relative p-2 bg-white rounded-full shadow-sm">
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>}
            </button>
        </div>
        {children}
      </main>

      {/* Notification Panel */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowNotifPanel(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">التنبيهات</h3>
                    <button onClick={() => setShowNotifPanel(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="overflow-y-auto h-full pb-20 p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">لا توجد إشعارات حالياً</div>
                    ) : (
                        [...notifications].reverse().map(notif => (
                            <div key={notif.id} className={`p-4 rounded-2xl border ${notif.type === 'warning' ? 'bg-amber-50 border-amber-100' : notif.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                                <div className="flex gap-3">
                                    {notif.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /> : notif.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> : <Info className="w-5 h-5 text-blue-500 shrink-0" />}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-1">{notif.title}</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                                        <span className="text-[10px] text-gray-400 mt-2 block">{notif.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl flex justify-around items-center h-16 px-6 rounded-3xl z-40">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-indigo-600 scale-110' : 'text-gray-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
