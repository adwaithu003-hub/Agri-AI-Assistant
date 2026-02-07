
export type AppView = 'home' | 'disease' | 'nutrient' | 'soil' | 'garden' | 'weather' | 'history' | 'chat' | 'cctv';

export interface WeatherData {
  temp: number;
  humidity: number;
  condition: string;
  location: string;
  alerts: string[];
}

export interface HistoryItem {
  id: string;
  type: AppView;
  title: string;
  date: string;
  content: string;
  imageUrl?: string;
}

export interface SoilReport {
  ph: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  texture: string;
}

export interface PlantCareDetails {
  name: string;
  pottingMix: string;
  watering: string;
  sunlight: string;
  floweringSeason: string;
  diseasesPests: string;
  fertilizerSchedule: string;
}
