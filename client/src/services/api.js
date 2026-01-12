// client/src/services/api.js

const API_URL = 'https://suraksha-a74u.onrender.com/api'; // Render URL

// ... baaki functions (login, register etc) same rahenge ...

// 👇 DEBUG WALA CHAT FUNCTION 👇
export const chatWithAI = async (message) => {
  console.log("🚀 Step 1: Chat Function Called");

  try {
    // -------------------
    // ATTEMPT 1: GOOGLE GEMINI
    // -------------------
    console.log("🤖 Step 2: Calling Google Gemini...");
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      console.error("❌ Gemini Server Error:", response.status);
      throw new Error("Gemini Failed");
    }

    const data = await response.json();
    console.log("✅ Gemini Success:", data);
    return data;

  } catch (error) {
    // -------------------
    // ATTEMPT 2: JOKE API (FALLBACK)
    // -------------------
    console.warn("⚠️ Google Failed. Switching to Joke Mode...", error);
    
    try {
      const jokeRes = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode&type=single');
      const jokeData = await jokeRes.json();
      
      console.log("🤡 Joke API Success");
      return { 
        reply: `(AI Connection Weak 📶) But here is a joke to cheer you up: ${jokeData.joke}` 
      };
    } catch (jokeError) {
      console.error("💀 BOTH APIs FAILED");
      return { 
        reply: "System Offline. Please check your internet connection." 
      };
    }
  }
};