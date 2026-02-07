
import React from 'react';
import { AppView } from '../types';
import { Bug, Sprout, Leaf, Cloud, ArrowRight, ShieldAlert, TestTube } from 'lucide-react';

interface HomeViewProps {
  setView: (view: AppView) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  const features = [
    {
      id: 'disease',
      title: 'Disease Scanner',
      desc: 'Upload leaf photos for instant AI disease diagnosis.',
      icon: <Bug className="text-rose-500" size={32} />,
      bgColor: 'bg-rose-50',
    },
    {
      id: 'nutrient',
      title: 'Nutrient Analysis',
      desc: 'Identify nutrient deficiencies like N, P, K from visual symptoms.',
      icon: <TestTube className="text-teal-500" size={32} />,
      bgColor: 'bg-teal-50',
    },
    {
      id: 'soil',
      title: 'Soil Lab',
      desc: 'Analyze soil health and get tailored crop recommendations.',
      icon: <Sprout className="text-amber-500" size={32} />,
      bgColor: 'bg-amber-50',
    },
    {
      id: 'garden',
      title: 'Garden Care',
      desc: 'Complete guide for planting, watering, and fertilization.',
      icon: <Leaf className="text-emerald-500" size={32} />,
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'cctv',
      title: 'Intrusion Guard',
      desc: 'CCTV monitoring for wild animals with real-time AI alerts.',
      icon: <ShieldAlert className="text-orange-500" size={32} />,
      bgColor: 'bg-orange-50',
    },
    {
      id: 'weather',
      title: 'Weather Intel',
      desc: 'Live updates and AI-powered natural disaster alerts.',
      icon: <Cloud className="text-sky-500" size={32} />,
      bgColor: 'bg-sky-50',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Farmer!</h1>
          <p className="text-slate-600 max-w-2xl">
            AgriIntel AI uses cutting-edge artificial intelligence to help you grow healthier crops.
          </p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setView(feature.id as AppView)}
            className="group p-6 bg-white border border-slate-200 rounded-3xl text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-sm">
              {feature.desc}
            </p>
            <div className="flex items-center text-emerald-600 font-semibold text-sm">
              Launch Tool <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeView;
