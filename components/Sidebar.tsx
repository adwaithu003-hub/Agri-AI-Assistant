
import React from 'react';
import { AppView } from '../types';
import { Home, Bug, Sprout, Leaf, Cloud, History, MessageSquare, Menu, X, ShieldAlert, Settings, TestTube } from 'lucide-react';

interface SidebarProps {
  activeView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'disease', label: 'Disease Scanner', icon: <Bug size={20} /> },
    { id: 'nutrient', label: 'Nutrient Analysis', icon: <TestTube size={20} /> },
    { id: 'soil', label: 'Soil Analyzer', icon: <Sprout size={20} /> },
    { id: 'garden', label: 'Garden Care', icon: <Leaf size={20} /> },
    { id: 'cctv', label: 'CCTV Monitor', icon: <ShieldAlert size={20} /> },
    { id: 'weather', label: 'Live Weather', icon: <Cloud size={20} /> },
    { id: 'chat', label: 'Agri Chat', icon: <MessageSquare size={20} /> },
    { id: 'history', label: 'History', icon: <History size={20} /> },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-3 text-emerald-600 mb-8">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Sprout size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">AgriIntel</h1>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as AppView);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeView === item.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <div className={activeView === item.id ? 'text-emerald-600' : 'text-slate-400'}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Settings size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-900 tracking-tighter leading-none">Settings</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">v1.2.0 Stable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
