import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");


export async function POST(req) {

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Ai Chat Bot",
    });

  try {
    
    const data = await req.json();

    // Construct the conversation history:
    const conversationHistory = data.map(message => {
        return `${message.role}: ${message.content}`;
      }).join("\n\n");
    

    // Combine the system instruction with the conversation history 
    const prompt = `${model.systemInstruction}\n\nHere's what has been discussed so far:\n${conversationHistory}\n`;

    // Send user's prompt and then get assistant's response:
    const result = await model.generateContentStream(prompt);
    const response = await result.response;
    const text = await response.text();
    // Return the assistant's response:
    return new Response(text);


  } catch (error) {
    console.error("Error in API Call:", error.message);
    console.error("Full Error Details:", error);
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}