import React, { useState, useRef, useEffect } from "react";

function Chatbot({ apiKey, weather }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null); // 👈 reference to bottom of chat

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const getChatbotResponse = async (userMessage) => {
  const msg = userMessage.toLowerCase().trim();

  // Greeting logic
  if (/(hi|hello|hey)\b/.test(msg)) return "Hello! 👋 How are you today?";
  if (msg.includes("thank")) return "You're very welcome! 😊 Stay safe!";
  if (msg.includes("help")) return "I can tell you the weather 🌦️ or give outfit suggestions! 👕";

  // --- Recommendation logic ---
if (msg.includes("recommend") || msg.includes("suggest")) {
  let currentWeather = weather;

  // fallback fetch if weather not passed
  if (!currentWeather || !currentWeather.weather) {
    console.log("Fetching default weather (Hyderabad)");
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=${apiKey}&units=metric`
    );
    currentWeather = await res.json();
  }

  if (!currentWeather.weather || !currentWeather.weather[0])
    return "Please check the weather first or ask me about a city 🌍";

  const condition = currentWeather.weather[0].main.toLowerCase();
  const desc = currentWeather.weather[0].description.toLowerCase();
  console.log("Detected condition:", condition, desc);

  // 🌦️ Smart recommendations based on weather type
  if (condition.includes("rain") || desc.includes("rain"))
    return "☔ It’s rainy — wear a waterproof jacket and carry an umbrella!";
  if (condition.includes("clear") || desc.includes("sunny"))
    return "😎 Clear skies — go for light cotton clothes, sunglasses, and drink water!";
  if (condition.includes("cloud") || desc.includes("overcast"))
    return "☁️ Cloudy — you might want a light hoodie or a comfy tee.";
  if (condition.includes("snow"))
    return "❄️ Snowy weather — wear a thick jacket, gloves, and boots!";
  if (condition.includes("drizzle"))
    return "🌦️ Light drizzle — keep a compact umbrella or raincoat handy.";
  if (condition.includes("mist") || condition.includes("fog"))
    return "🌫️ Misty/foggy — wear visible colors and be cautious outdoors.";
  if (condition.includes("haze") || condition.includes("smoke"))
    return "😷 Air quality seems poor — wear a mask and avoid staying out too long.";
  if (condition.includes("dust") || condition.includes("sand"))
    return "🌬️ Dusty — wear a mask or scarf to protect yourself!";
  if (condition.includes("thunder"))
    return "⚡ Thunderstorms — better stay indoors and unplug electronics!";
  if (condition.includes("ash") || condition.includes("volcanic"))
    return "🌋 Volcanic ash detected — stay indoors and keep windows shut.";
  if (condition.includes("squall"))
    return "💨 Strong winds ahead — secure loose items and wear a windbreaker!";
  if (condition.includes("tornado"))
    return "🌪️ Tornado alert — stay in a safe shelter immediately!";

  // fallback
  return `🌍 The weather is ${desc}. Dress comfortably and stay safe!`;
}


  // --- City Weather Check ---
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
    const botReply = await getChatbotResponse(trimmedInput);
    const botMessage = { sender: "bot", text: botReply };

    // Update both messages at once to avoid repetition
    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
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
        <div ref={chatEndRef} /> {/* 👈 always scrolls to this */}
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
