import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Nav from "./Nav";
import Rooms from "./rooms/Rooms";
import Users from "./users/Users";
import DirectMessages from "./dms/DirectMessages";
import {
  Sms,
  SmsOutlined,
  People,
  PeopleOutlined,
  Person,
  PersonOutlined,
} from "@mui/icons-material";

const Sidebar = ({
  currentRoom,
  setCurrentRoom,
  currentDm,
  setCurrentDm,
  setShowChatMessages,
}) => {
  const [user] = useAuthState(auth);

  const [rooms, setRooms] = useState(true);
  const [users, setUsers] = useState(false);
  const [dms, setDms] = useState(false);

  const showRooms = () => {
    setRooms(true);
    setUsers(false);
    setDms(false);
    setShowChatMessages(false);
  };

  const showUsers = () => {
    setRooms(false);
    setUsers(true);
    setDms(false);
  };

  const showDms = () => {
    setRooms(false);
    setUsers(false);
    setDms(true);
  };
  return (
    <div className="sidebar">
      <Nav user={user} />
      <div className="sidebar__content">
        {rooms && (
          <Rooms currentRoom={currentRoom} setCurrentRoom={setCurrentRoom} />
        )}
        {users && (
          <Users
            currentDm={currentDm}
            setCurrentDm={setCurrentDm}
            setShowChatMessages={setShowChatMessages}
          />
        )}
        {dms && (
          <DirectMessages
            currentDm={currentDm}
            setCurrentDm={setCurrentDm}
            setShowChatMessages={setShowChatMessages}
          />
        )}
      </div>

      <div className="sidebar__footer">
        {rooms ? (
          <Sms onClick={showRooms} className="active" />
        ) : (
          <SmsOutlined onClick={showRooms} />
        )}
        {users ? (
          <People onClick={showUsers} className="active" />
        ) : (
          <PeopleOutlined onClick={showUsers} />
        )}

        {dms ? (
          <Person onClick={showDms} className="active" />
        ) : (
          <PersonOutlined onClick={showDms} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
