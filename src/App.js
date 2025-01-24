import React, { useState } from 'react';
import './App.css';

const API_KEY = '895284fb2d2c50a520ea537456963d9c';

function App() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState('imperial');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchWeather = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${API_KEY}`
      );
      if (!weatherResponse.ok) {
        throw new Error('Location not found');
      }
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();
      setForecastData(forecastData);

      // Add location to search history
      if (!history.includes(location)) {
        setHistory([...history, location]);
      }

      setError('');
    } catch (err) {
      setError('Location not found. Please try again.');
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${API_KEY}`
          );
          const data = await response.json();
          setWeatherData(data);
          setError('');
        } catch {
          setError('Unable to fetch weather for your current location.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Geolocation permission denied.');
      }
    );
  };

  const handleUnitSelection = (selectedUnit) => {
    setUnit(selectedUnit);
    fetchWeather();
  };

  const handleLocationSubmit = () => {
    fetchWeather();
  };

  return (
    <div className="app">
      <h1>Weather Dashboard</h1>

      <div className="search-bar">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={handleLocationSubmit}>Get Weather</button>
        <button onClick={fetchCurrentLocationWeather}>Use Current Location</button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {weatherData && (
        <div className="weather-card">
          <WeatherCard data={weatherData} unit={unit} />
          <button onClick={() => handleUnitSelection(unit === 'imperial' ? 'metric' : 'imperial')}>
            Switch to {unit === 'imperial' ? 'Celsius' : 'Fahrenheit'}
          </button>
        </div>
      )}

      {forecastData && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-container">
            {forecastData.list.slice(0, 5).map((forecast, index) => (
              <ForecastCard key={index} data={forecast} unit={unit} />
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3>Search History</h3>
          <ul>
            {history.map((item, index) => (
              <li key={index} onClick={() => setLocation(item)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WeatherCard({ data, unit }) {
  const { main, weather, wind, name } = data;
  const temperature = main.temp;
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const weatherDescription = weather[0].description;

  return (
    <div className="weather-card-content">
      <h2>{name}</h2>
      <p>{weatherDescription}</p>
      <div className="weather-details">
        <p>Temperature: {temperature}° {unit === 'imperial' ? 'F' : 'C'}</p>
        <p>Humidity: {humidity}%</p>
        <p>Wind Speed: {windSpeed} m/s</p>
      </div>
    </div>
  );
}

function ForecastCard({ data, unit }) {
  const { main, weather, dt_txt } = data;
  const temperature = main.temp;
  const weatherDescription = weather[0].description;

  return (
    <div className="forecast-card">
      <p>{new Date(dt_txt).toLocaleDateString()}</p>
      <p>{weatherDescription}</p>
      <p>Temp: {temperature}° {unit === 'imperial' ? 'F' : 'C'}</p>
    </div>
  );
}

export default App;
