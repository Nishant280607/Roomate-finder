import "./message.css";

function Message({ message }) {
  return (
    <div className={`message-row ${message.sender}`}>
      <div className="message-bubble">
        <p>{message.text}</p>
        <span>{message.time}</span>
      </div>
    </div>
  );
}

export default Message;