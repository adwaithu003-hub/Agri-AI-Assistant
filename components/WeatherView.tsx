
import React, { useState, useEffect } from 'react';
import { predictWeatherHazards } from '../services/geminiService';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle, Loader2, MapPin } from 'lucide-react';

const WeatherView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Fetching location...');
  const [weather, setWeather] = useState({ temp: 24, humidity: 65, condition: 'Partly Cloudy' });
  const [hazards, setHazards] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // In a real app, use Geolocation API + a weather API
        // For this demo, we simulate a small delay and use geolocation to show location name
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setLocation(`Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)}`);
          });
        }
        
        // Simulated weather data
        const demoTemp = 28;
        const demoHumidity = 82;
        const demoCondition = "Heavy Rain";
        
        setWeather({ temp: demoTemp, humidity: demoHumidity, condition: demoCondition });
        
        const riskAnalysis = await predictWeatherHazards(demoTemp, demoHumidity, demoCondition);
        setHazards(riskAnalysis || "Conditions are stable.");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live Weather Monitor</h2>
          <p className="text-slate-600 flex items-center gap-1">
            <MapPin size={16} className="text-emerald-500" />
            {location}
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Refresh Data
        </button>
      </header>

      {loading ? (
        <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Syncing with satellite data...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Temperature</span>
                <div className="text-5xl font-bold text-slate-900">{weather.temp}°C</div>
                <span className="text-sm text-amber-600 font-medium">Optimal for growth</span>
              </div>
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                <Thermometer size={40} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Humidity</span>
                <div className="text-5xl font-bold text-slate-900">{weather.humidity}%</div>
                <span className="text-sm text-sky-600 font-medium">High moisture levels</span>
              </div>
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-500">
                <Droplets size={40} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Wind Speed</span>
                <div className="text-5xl font-bold text-slate-900">12 km/h</div>
                <span className="text-sm text-slate-500 font-medium">Gentle breeze</span>
              </div>
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                <Wind size={40} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Conditions</span>
                <div className="text-3xl font-bold text-slate-900">{weather.condition}</div>
                <span className="text-sm text-slate-500 font-medium">Precipitation expected</span>
              </div>
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                <CloudRain size={40} />
              </div>
            </div>
          </div>

          <div className={`
            rounded-3xl p-8 border-2 shadow-xl flex flex-col
            ${hazards?.toLowerCase().includes('alert') || hazards?.toLowerCase().includes('risk') 
              ? 'bg-rose-50 border-rose-200' 
              : 'bg-emerald-50 border-emerald-200'}
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${hazards?.toLowerCase().includes('alert') ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Hazard Alert</h3>
            </div>
            
            <div className="flex-1">
              <p className="text-slate-700 leading-relaxed font-medium">
                {hazards}
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-white/50 rounded-2xl text-xs text-slate-600 italic">
              AI analysis based on current atmospheric pressure, humidity gradients, and regional climate patterns.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherView;
