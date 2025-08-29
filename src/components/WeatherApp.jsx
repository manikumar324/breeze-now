import React, { useState } from 'react';
import { Search, MapPin, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/weather-hero.jpg';

const WeatherApp = () => {
  const [searchCity, setSearchCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getWeatherData = async (city) => {
    setLoading(true);
    try {
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geocodeData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=visibility&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      const weatherCodeToDescription = {
        0: { description: 'Clear sky', icon: '☀️' },
        1: { description: 'Mainly clear', icon: '🌤️' },
        2: { description: 'Partly cloudy', icon: '⛅' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Foggy', icon: '🌫️' },
        48: { description: 'Depositing rime fog', icon: '🌫️' },
        51: { description: 'Light drizzle', icon: '🌦️' },
        53: { description: 'Moderate drizzle', icon: '🌦️' },
        55: { description: 'Dense drizzle', icon: '🌧️' },
        61: { description: 'Slight rain', icon: '🌧️' },
        63: { description: 'Moderate rain', icon: '🌧️' },
        65: { description: 'Heavy rain', icon: '⛈️' },
        71: { description: 'Slight snow fall', icon: '🌨️' },
        73: { description: 'Moderate snow fall', icon: '❄️' },
        75: { description: 'Heavy snow fall', icon: '❄️' },
        95: { description: 'Thunderstorm', icon: '⛈️' },
      };

      const weatherCode = weatherData.current.weather_code;
      const weatherInfo = weatherCodeToDescription[weatherCode] || { description: 'Unknown', icon: '🌡️' };

      setWeather({
        location: `${name}, ${country}`,
        temperature: Math.round(weatherData.current.temperature_2m),
        description: weatherInfo.description,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        visibility: Math.round(weatherData.hourly.visibility[0] / 1000),
        icon: weatherInfo.icon,
      });

      toast({
        title: "Weather Updated",
        description: `Weather data for ${name} has been loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please check the city name and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      getWeatherData(searchCity.trim());
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-weather-gradient opacity-80"></div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Weather Now</h1>
            <p className="text-lg text-white/90">Get current weather conditions for any city worldwide</p>
          </div>

          <Card className="bg-weather-card backdrop-blur-md border-white/20 shadow-weather mb-8">
            <div className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Enter city name..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !searchCity.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {weather && (
            <Card className="bg-weather-card backdrop-blur-md border-white/20 shadow-weather transition-smooth">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">{weather.icon}</div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">{weather.location}</h2>
                  <div className="text-6xl font-bold text-primary mb-2">{weather.temperature}°C</div>
                  <p className="text-xl text-muted-foreground capitalize">{weather.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg">
                    <Droplets className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-xl font-semibold text-card-foreground">{weather.humidity}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg">
                    <Wind className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wind Speed</p>
                      <p className="text-xl font-semibold text-card-foreground">{weather.windSpeed} km/h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg">
                    <Eye className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Visibility</p>
                      <p className="text-xl font-semibold text-card-foreground">{weather.visibility} km</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!weather && !loading && (
            <Card className="bg-weather-card backdrop-blur-md border-white/20 shadow-weather">
              <div className="p-8 text-center">
                <Thermometer className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Ready to Check Weather</h3>
                <p className="text-muted-foreground">Enter a city name above to get current weather conditions</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
