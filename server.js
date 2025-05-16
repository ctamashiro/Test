
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/api/explain", async (req, res) => {
  const { question, selected, correct } = req.body;

  const prompt = `
You are a helpful tutor. A student just completed a cybersecurity quiz.

Question: ${question}
Their Answer: ${selected}
Correct Answer: ${correct}

Please explain whether the answer is correct and why, in simple and educational terms.
DO NOT ask follow-up questions or offer to review more material or tell me to keep up the great work. Just give the explanation only.
JUST DO NOT ask any questions no matter what, you can format things like "Why is it important" as like a heading, but no follow up questions
do not ask me any questions whatsoever.
`;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const explanation = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Gemini did not return a valid explanation.";
    res.json({ explanation });
  } catch (err) {
    console.error("🔥 Gemini REST error:", err.response?.data || err.message);
    res.status(500).json({ explanation: "❌ Error generating explanation from Gemini REST." });
  }
});

app.listen(3000, () => {
  console.log("🌐 Gemini REST API server running at http://localhost:3000");
});
