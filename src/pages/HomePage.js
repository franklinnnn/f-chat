import React, { useState } from "react";
import ChatRoom from "../components/ChatRoom";
import ChatMessages from "../components/ChatMessages";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const [currentRoom, setCurrentRoom] = useState("General");
  const [currentDm, setCurrentDm] = useState({ id: "", user: "" });
  const [showChatMessages, setShowChatMessages] = useState(false);
  return (
    <div className="homePage">
      <div className="homePage__container">
        <ChatRoom currentRoom={currentRoom} />
        {showChatMessages && <ChatMessages currentDm={currentDm} />}
        <Sidebar
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
          setCurrentDm={setCurrentDm}
          setShowChatMessages={setShowChatMessages}
        />
      </div>
    </div>
  );
};

export default HomePage;
