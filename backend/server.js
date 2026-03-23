import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a disaster preparedness assistant for a student mobile app. " +
            "Give concise, practical, safety-focused advice about floods, fires, earthquakes, storms, shelter finding, emergency kits, and immediate response actions. " +
            "Do not invent local emergency numbers. If unsure, advise the user to check official emergency guidance.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      response.output_text ||
      "I’m sorry, I couldn’t generate a response just now.";

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to generate response.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Chat backend running on http://localhost:${port}`);
});