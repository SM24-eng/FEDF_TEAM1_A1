
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, scales } from 'chart.js';
import React , {useState,useEffect} from "react";
import './App.css';
import searchIcon from './images/search.png';
import cloudyIcon from './images/clouds.png';
import rainIcon from './images/rain.png';
import clearIcon from './images/clear.png';
import snowIcon from './images/snow.png';
import drizzleIcon from './images/drizzle.png';
import mistIcon from './images/mist.png';
import humidIcon from './images/humidity.png';
import windIcon from './images/wind.png';
import Login from "./login";
import Chatbot from "./chatbot";
import chatIcon from './images/chatIcon.png';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function WeatherApp() {
  const apikey=process.env.REACT_APP_WEATHER_API_KEY;
       const [city,setcity]=useState("");
       const [weather,setweather]=useState(null);
       const [forecast,setforecast ]=useState([]);
       const [showChat, setShowChat] = useState(false);


       const fetchweather=async () =>{
        if(!city) return;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`
          );
          const data =await response.json();
          if (data.cod===200){
            setweather(data);
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`);
            const forecastData = await forecastResponse.json();
            if (forecastData.cod === "200") {
              setforecast(forecastData.list.slice(0, 8));
            }
          }else {
            alert("city not found");
          }
        }catch(error) {
            console.error("Error fetching weather:",error);
          }
        };
        const getRecommendations = () => {
  if (!weather) return [];

  const recommendations = [];
  const temp = weather.main.temp;
  const condition = weather.weather[0].main;
  const windSpeed = weather.wind.speed;
  const humidity = weather.main.humidity;

  // Temperature-based
  if (temp > 35) {
    recommendations.push("It's very hot outside, stay hydrated and avoid direct sun!");
  } else if (temp > 25) {
    recommendations.push("It's warm outside, light clothes recommended.");
  } else if (temp < 10) {
    recommendations.push("It's cold outside, wear a warm coat and gloves!");
  } else {
    recommendations.push("Temperature is moderate, dress comfortably.");
  }

  switch (condition) {
    case "Rain":
      recommendations.push("Don't forget your umbrella or raincoat!");
      break;
    case "Drizzle":
      recommendations.push("Light rain outside, carry a small umbrella just in case.");
      break;
    case "Clear":
      recommendations.push("It's sunny, carry sunglasses and sunscreen.");
      break;
    case "Clouds":
      recommendations.push("Cloudy weather, good day for a walk.");
      break;
    case "Snow":
      recommendations.push("Snowfall expected, wear warm clothes and boots.");
      break;
    case "Mist":
      recommendations.push("Visibility is low due to mist, drive carefully.");
      break;
    default:
      recommendations.push("Have a great day!");
  }

  // Humidity & wind
  if (humidity > 80) {
    recommendations.push("High humidity, stay hydrated.");
  }

  if (windSpeed > 15) {
    recommendations.push("Strong winds, secure loose items outside.");
  }

  return recommendations;
};

        const chartData = {
          labels: forecast.map((item) => item.dt_txt.split(" ")[1].slice(0, 5)),
          datasets: [
            {
              label: "Temperature (°C)",
              data: forecast.map((item) => item.main.temp),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Humidity (%)",
              data: forecast.map((item) => item.main.humidity),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
              tension: 0.4,
            }
          ],
        };
        const chartOptions = {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label || "";
                  const value = context.parsed.y || 0;
                  return `${label}: ${value}`;
                },
              },
            },
          
            scales: {
              y: {
                beginAtZero: true,
                position: 'left',
                title: { display: true, text: 'Value' },
              },
              y1: {
                beginAtZero: true,
                position: 'right',
                grid: {
                  drawOnChartArea: false,
                },
                title: { display: true, text: 'Value' },
              },
            },
          },
        };

  return (

          <div className="main-grid">
      {/* Search & Weather Card */}

      <section  className="card" id="weather-card">
        <div className="search">
          <input
            type="text"
            placeholder="Enter location name"
            value={city}
            onChange={(e) => setcity(e.target.value)}
          />
          <button onClick={fetchweather}>
            <img src={searchIcon} alt="search" />
          </button>
        </div>

        {weather && (
          <div className="weather">
            <img
              src={
                weather.weather[0].main === "Rain"
                  ? rainIcon
                  : weather.weather[0].main === "Clouds"
                  ? cloudyIcon
                  : weather.weather[0].main === "Clear"
                  ? clearIcon
                  : weather.weather[0].main === "Snow"
                  ? snowIcon
                  : weather.weather[0].main === "Drizzle"
                  ? drizzleIcon
                  : mistIcon
              }
              alt="weatherIcon"
              className="weatherIcon"
            />
            <h1 className="temp">{weather.main.temp}°C</h1>
            <h2 className="city">{weather.name}</h2>
            <div className="details">
              <div className="col">
                <img src={cloudyIcon} alt="humidity-icon" />
                <p className="humidity">{weather.main.humidity}%</p>
                <p>Humidity</p>
              </div>

              <div className="col">
                <img src={windIcon} alt="wind-icon" />
                <p className="wind">{weather.wind.speed} km/h</p>
                <p>Wind Speed</p>
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="card" id="recommendations-card">
  <div className="recommendations">
    <h2>Recommendations</h2>
    <ul>
      {getRecommendations().map((rec, index) => (
        <li key={index}>
          <span role="img" aria-label="icon">
            {rec.includes("umbrella") ? "☔" :
             rec.includes("hydrated") ? "💧" :
             rec.includes("sun") ? "😎" :
             rec.includes("warm") ? "🧥" :
             rec.includes("wind") ? "🌬️" : "✅"}
          </span>{" "}
          {rec}
        </li>
      ))}
    </ul>
    <p style={{ textAlign: "center", marginTop: "15px", fontStyle: "italic", fontSize: "14px" }}>
      Stay safe and enjoy your day! 🌤️
    </p>
  </div>
</section>

      
      {forecast.length > 0 && (
        <section className="card" id="forecast-card">
          <div className="forecast">
          <h2>forecast Graph</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
        </section>
      )}
      {/* Floating Chat Icon */}
<div className="chat-toggle" onClick={() => setShowChat(!showChat)}>
  <img src={chatIcon} alt="Chat" />
</div>

{/* Chatbot Component */}
{showChat && <Chatbot apiKey={apikey} />}

    </div>
  );
}

export default WeatherApp;
