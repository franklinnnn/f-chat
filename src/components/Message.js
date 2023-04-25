import React, { useState } from "react";
import { auth } from "../firebase";

const Message = ({ message }) => {
  const { id, text, uid, user, createdAt, photoURL, img } = message;
  const messageClass =
    uid === auth.currentUser.uid ? "message__sent" : "message__received";
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={`message ${messageClass}`}>
      <div className="message__userInfo">
        <img src={photoURL} alt="" />
      </div>
      <div className="message__contents">
        <span>{user}</span>

        {img && <img src={img} alt="" />}
        {text === "" ? null : <p>{text}</p>}
        <div
          className="message__actions"
          style={{
            display:
              showActions && uid === auth.currentUser.uid ? "block" : "none",
          }}
        >
          <button>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default Message;
