const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config(); // For loading API keys from a `.env` file

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI API Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your Render environment or `.env` file
});
const openai = new OpenAIApi(configuration);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Serve the single-page application
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ChatGPT Website</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #2c3e50, #4ca1af);
          color: #fff;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }
        .chat-container {
          width: 90%;
          max-width: 600px;
          background: #1a1a1a;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        .chat-header {
          background: #4ca1af;
          padding: 15px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .chat-messages {
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
          background: #262626;
        }
        .chat-messages .message {
          margin-bottom: 15px;
        }
        .chat-messages .message.user {
          text-align: right;
        }
        .chat-messages .message-bubble {
          display: inline-block;
          padding: 10px 15px;
          border-radius: 10px;
          background: #4ca1af;
          color: #fff;
          max-width: 70%;
        }
        .chat-input {
          display: flex;
          padding: 10px;
          background: #333;
        }
        .chat-input input {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 5px;
          outline: none;
          margin-right: 10px;
        }
        .chat-input button {
          background: #4ca1af;
          border: none;
          color: #fff;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .chat-input button:hover {
          transform: scale(1.1);
        }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <div class="chat-header">
          ChatGPT
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input">
          <input type="text" id="userInput" placeholder="Type your message...">
          <button id="sendBtn">Send</button>
        </div>
      </div>
  
      <script>
        const chatMessages = document.getElementById('chatMessages');
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
  
        const addMessage = (message, sender) => {
          const messageElement = document.createElement('div');
          messageElement.classList.add('message', sender);
          messageElement.innerHTML = `<div class="message-bubble">${message}</div>`;
          chatMessages.appendChild(messageElement);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        };
  
        const fetchResponse = async (message) => {
          addMessage("...", "bot"); // Placeholder while waiting for response
          try {
            const response = await fetch('/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message }),
            });
            const data = await response.json();
            chatMessages.lastChild.remove(); // Remove placeholder
            addMessage(data.reply, 'bot');
          } catch (error) {
            chatMessages.lastChild.remove(); // Remove placeholder
            addMessage('Something went wrong. Try again later.', 'bot');
          }
        };
  
        sendBtn.addEventListener('click', () => {
          const message = userInput.value.trim();
          if (!message) return;
          addMessage(message, 'user');
          userInput.value = '';
          fetchResponse(message);
        });
  
        userInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendBtn.click();
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Handle chat requests with OpenAI
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003", // Choose your preferred model
      prompt: userMessage,
      max_tokens: 150,
    });

    const reply = completion.data.choices[0].text.trim();
    res.json({ reply });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
           
