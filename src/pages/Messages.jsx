import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  messageService,
  initialConversations,
  initialMessages,
} from "../services/messageService";
import "./Messages.css";

export const conversations = initialConversations;
export const messagesByConversation = initialMessages;

function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");

  const [conversationList, setConversationList] = useState(initialConversations);
  const [activeConvId, setActiveConvId] = useState(1);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (targetUserId) {
      const found = conversationList.find((c) => String(c.id) === String(targetUserId));
      if (found) setActiveConvId(found.id);
    }
  }, [targetUserId, conversationList]);

  useEffect(() => {
    async function load() {
      const convs = await messageService.getConversations(user?.id);
      setConversationList(convs);
      const msgs = await messageService.getMessages(activeConvId);
      setMessages(msgs);
    }
    load();
  }, [user, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const activeConversation =
    conversationList.find((c) => c.id === activeConvId) || conversationList[0];

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = await messageService.sendMessage(activeConvId, inputText.trim(), "me");
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const replies = [
        "That sounds awesome! When would you be free for a quick video call?",
        "Totally agree with you! Looking forward to chatting more about the place.",
        "Yes, the neighborhood is super quiet and transit is just 5 minutes away!",
        "Perfect, let me send you the floor plan and lease details tonight!",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg = await messageService.sendMessage(activeConvId, randomReply, "them");
      setMessages((prev) => [...prev, botMsg]);
    }, 1400);
  }

  return (
    <div className="messages-layout animate-fade-up">
      <aside className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
          <span className="unread-badge-total">4 unread</span>
        </div>

        <div className="conversations-scroll-list">
          {conversationList.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === activeConvId ? "active" : ""}`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <div className="conv-avatar-box">
                <img src={conv.image} alt={conv.name} />
                {conv.online && <span className="online-indicator"></span>}
              </div>

              <div className="conv-info">
                <div className="conv-top-row">
                  <h4>{conv.name}</h4>
                  <span className="conv-time">{conv.time}</span>
                </div>
                <div className="conv-bottom-row">
                  <p className="conv-snippet">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="conv-unread-count">{conv.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-window">
        <div className="chat-header">
          <div className="chat-recipient">
            <div className="chat-recipient-avatar">
              <img src={activeConversation.image} alt={activeConversation.name} />
              {activeConversation.online && <span className="online-indicator"></span>}
            </div>
            <div>
              <h3>{activeConversation.name}</h3>
              <span className="chat-status-text">
                {activeConversation.online ? "● Active now" : "Offline"} · {activeConversation.occupation}
              </span>
            </div>
          </div>
        </div>

        <div className="chat-messages-body">
          <div className="chat-date-divider">
            <span>Today</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble-row ${msg.sender === "me" ? "sent" : "received"}`}
            >
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="message-timestamp">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="typing-indicator-row">
              <span className="typing-text">{activeConversation.name.split(" ")[0]} is typing</span>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message to discuss your next home..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-send-message" disabled={!inputText.trim()}>
            Send →
          </button>
        </form>
      </main>
    </div>
  );
}

export default Messages;