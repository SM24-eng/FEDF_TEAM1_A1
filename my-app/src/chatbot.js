import React, { useState, useRef, useEffect } from "react";

function Chatbot({ apiKey, weather }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatWeather, setChatWeather] = useState(weather || null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep chatbot's weather in sync with main app
  useEffect(() => {
    if (weather) setChatWeather(weather);
  }, [weather]);

  const getChatbotResponse = async (userMessage) => {
    const msg = userMessage.toLowerCase().trim();

    if (/(hi|hello|hey)\b/.test(msg)) return "Hello! 👋 How are you today?";
    if (msg.includes("thank")) return "You're very welcome! 😊 Stay safe!";
    if (msg.includes("help"))
      return "I can tell you the weather 🌦️ or give outfit suggestions! 👕";

    // Recommendations
    if (msg.includes("recommend") || msg.includes("suggest")) {
      let currentWeather = chatWeather;

      if (!currentWeather || !currentWeather.weather) {
        return "Please check the weather first (e.g., type 'weather in Delhi') so I can recommend properly 🌦️";
      }

      const condition = currentWeather.weather[0].main.toLowerCase();
      const desc = currentWeather.weather[0].description.toLowerCase();
      const city = currentWeather.name || "your location";

      let recommendation = "";

      if (condition.includes("rain") || desc.includes("rain")) {
        recommendation = "☔ It’s rainy — wear a waterproof jacket and carry an umbrella!";
      } else if (condition.includes("clear") || desc.includes("sunny")) {
        recommendation = "😎 Clear skies — go for light cotton clothes, sunglasses, and stay hydrated!";
      } else if (condition.includes("cloud") || desc.includes("overcast")) {
        recommendation = "☁️ Cloudy — maybe a light hoodie or a comfy tee!";
      } else if (condition.includes("snow")) {
        recommendation = "❄️ Snowy weather — thick jacket, gloves, and boots are your best friends!";
      } else if (condition.includes("drizzle")) {
        recommendation = "🌦️ Light drizzle — keep a compact umbrella or raincoat handy.";
      } else if (condition.includes("mist") || condition.includes("fog")) {
        recommendation = "🌫️ Misty/foggy — wear visible colors and be cautious outdoors.";
      } else if (condition.includes("haze") || condition.includes("smoke")) {
        recommendation = "😷 Air quality seems poor — wear a mask and avoid long outdoor stays.";
      } else if (condition.includes("dust") || condition.includes("sand")) {
        recommendation = "🌬️ Dusty — wear a mask or scarf to protect yourself!";
      } else if (condition.includes("thunder")) {
        recommendation = "⚡ Thunderstorms — better stay indoors and unplug electronics!";
      } else if (condition.includes("ash") || condition.includes("volcanic")) {
        recommendation = "🌋 Volcanic ash detected — stay indoors and keep windows shut.";
      } else if (condition.includes("squall")) {
        recommendation = "💨 Strong winds — secure loose items and wear a windbreaker!";
      } else if (condition.includes("tornado")) {
        recommendation = "🌪️ Tornado alert — stay in a safe shelter immediately!";
      } else {
        recommendation = `🌍 The weather is ${desc}. Dress comfortably and stay safe!`;
      }

      return `Based on the weather in ${city}, ${recommendation}`;
    }

    // City weather
    const cityPattern = /(?:weather\s*(?:in|at|for)?\s*)([a-zA-Z\s]+)/i;
    const match = msg.match(cityPattern);
    const city = match ? match[1].trim() : null;

    if (city) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();

        if (data.cod === 200) {
          // Store this fetched weather for future recommendations
          setChatWeather(data);
          return `🌤️ Weather in ${data.name}: ${data.main.temp}°C, ${data.weather[0].main}`;
        } else {
          return `❌ I couldn’t find weather for "${city}". Try another city.`;
        }
      } catch (err) {
        console.error(err);
        return "⚠️ Error fetching weather data.";
      }
    }

    return "I'm still learning 🤖. Try 'weather in Hyderabad' or 'recommend something'.";
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const botReply = await getChatbotResponse(trimmedInput);
    const botMessage = { sender: "bot", text: botReply };

    setMessages((prev) => [...prev, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-container">
      <h3>Weather Chatbot</h3>

      <div className="chat-log">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === "user" ? "chat-user" : "chat-bot"}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me about weather or say hi..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
