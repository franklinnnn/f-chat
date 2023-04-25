import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { Add, ArrowRight } from "@mui/icons-material";
import AddRoom from "./AddRoom";
import RoomActions from "./RoomActions";
import "./rooms.css";

const Rooms = ({ currentRoom, setCurrentRoom }) => {
  const [user] = useAuthState(auth);

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const getRooms = () => {
      const unsub = onSnapshot(collection(db, "rooms"), (snapshot) => {
        let rooms = [];
        snapshot.docs.forEach((doc) => {
          rooms.push({ ...doc.data(), id: doc.id });
        });
        setRooms(rooms);
      });

      return () => {
        unsub();
      };
    };
    getRooms();
  }, []);

  const handleSelect = async (room, uid) => {
    // change current room to selected room
    setCurrentRoom(room);
    // console.log(`current room ${room}`);

    // get room from database
    const res = await getDoc(doc(db, "rooms", room));
    if (res.exists()) {
      await updateDoc(doc(db, "rooms", currentRoom), {
        [uid + ".userInfo"]: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
    }
  };

  const [addRoom, setAddRoom] = useState(false);
  const [roomActions, setRoomActions] = useState(false);
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  return (
    <div className="rooms">
      {addRoom && <AddRoom setAddRoom={setAddRoom} />}
      <div className="rooms__header">
        Rooms{" "}
        <Add
          ref={ref}
          onClick={() => {
            setAddRoom(true);
          }}
        />
      </div>

      {rooms
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((room) => (
          <div
            className={currentRoom === `${room.name}` ? "room__active" : "room"}
            key={room.uid}
            onClick={() => handleSelect(room.name, room.uid)}
          >
            <div className="room__info">
              {!room.photoURL ? (
                <img
                  src="https://media.istockphoto.com/id/1255861967/photo/woman-hand-typing-on-keyboard-laptop-with-mobile-smartphone-live-chat-chatting-on-application.jpg?b=1&s=612x612&w=0&k=20&c=XaBmOy_3PdcZh3niEP2gOrLqp0-2tTFf-Za0cAOW6PI="
                  alt=""
                />
              ) : (
                <img src={room.photoURL} alt="" />
              )}

              <span>{room.name}</span>
            </div>
            {currentRoom === `${room.name}` ? (
              <div
                className="room__options"
                ref={ref}
                onClick={() => setIsComponentVisible(true)}
              >
                <ArrowRight />
                {isComponentVisible && (
                  <RoomActions room={room} setCurrentRoom={setCurrentRoom} />
                )}
              </div>
            ) : null}
          </div>
        ))}
    </div>
  );
};

// handle closing actions window when clicking outside it
const useComponentVisible = (initialVisible) => {
  const [isComponentVisible, setIsComponentVisible] = useState(initialVisible);

  const ref = useRef();
  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setIsComponentVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return { ref, isComponentVisible, setIsComponentVisible };
};

export default Rooms;
