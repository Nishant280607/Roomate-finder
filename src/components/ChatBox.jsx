import { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hey! 👋 I'm RoomieBot. How can I help you find your perfect roommate?",
    },
  ]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((current) => [...current, newMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I'd recommend checking Discover and looking for people with a high compatibility score.",
        },
      ]);
    }, 600);
  };

  return (
    <>
      {isOpen && (
        <div className="chatbot">
          <div className="chatbot-header">
            <div className="chatbot-person">
              <div className="chatbot-avatar">R</div>

              <div>
                <strong>RoomieBot</strong>
                <span>Online now</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chatbot-body">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form
            className="chatbot-form"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />

            <button type="submit">
              ↑
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open chatbot"
      >
        {isOpen ? "×" : "✦"}
      </button>
    </>
  );
}

export default Chatbot;