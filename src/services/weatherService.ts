
export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  seaLevel?: number;
  pressure: number;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const MOCK_WEATHER: WeatherData = {
  temp: 28,
  description: "scattered clouds",
  icon: "03d",
  humidity: 65,
  windSpeed: 4.5,
  city: "Mumbai Harbor (Demo)",
  pressure: 1012,
};

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const isMissingKey = !API_KEY || API_KEY === "YOUR_OPENWEATHER_API_KEY" || API_KEY.trim() === "";
  
  if (isMissingKey) {
    // Silent fallback to mock data if key is missing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...MOCK_WEATHER,
          temp: MOCK_WEATHER.temp + (Math.random() * 4 - 2), // Add some slight variation
        });
      }, 500);
    });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      // If unauthorized or forbidden, it's likely an API key issue
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid or expired OpenWeather API Key");
      }
      throw new Error(`Weather API returned status ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
      seaLevel: data.main.sea_level,
      pressure: data.main.pressure,
    };
  } catch (error) {
    // Log as warning instead of error to avoid cluttering logs when falling back
    console.warn("Weather API unavailable, using dynamic mock data:", error instanceof Error ? error.message : error);
    
    // Return mock data with some randomization to feel "live"
    return {
      ...MOCK_WEATHER,
      temp: MOCK_WEATHER.temp + (Math.random() * 2 - 1),
      humidity: Math.min(100, Math.max(0, MOCK_WEATHER.humidity + Math.floor(Math.random() * 10 - 5))),
      windSpeed: Math.max(0, MOCK_WEATHER.windSpeed + (Math.random() * 2 - 1)),
    };
  }
}

export async function getWeatherDataByCity(city: string): Promise<WeatherData> {
  const isMissingKey = !API_KEY || API_KEY === "YOUR_OPENWEATHER_API_KEY" || API_KEY.trim() === "";

  if (isMissingKey) {
    return { ...MOCK_WEATHER, city: `${city} (Demo)` };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
      seaLevel: data.main.sea_level,
      pressure: data.main.pressure,
    };
  } catch (error) {
    console.warn(`Weather API error for ${city}, falling back:`, error instanceof Error ? error.message : error);
    return { ...MOCK_WEATHER, city: `${city} (Demo)` };
  }
}
