import React, { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { addDoc, collection, orderBy, query } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { AddPhotoAlternate, Check } from "@mui/icons-material";
import Message from "./Message";

const ChatRoom = ({ currentRoom }) => {
  const customRef = useRef();

  const [message, setMessage] = useState("");
  const [img, setImg] = useState(null);

  const q = query(
    collection(db, "rooms", currentRoom, "messages"),
    orderBy("createdAt")
  );

  const [messages] = useCollectionData(q, { idField: "id" });

  useEffect(() => {
    customRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const createdAt = serverTimestamp();
    const { uid, photoURL, displayName } = auth.currentUser;

    if (img) {
      const storageRef = ref(storage, `rooms/${currentRoom}/${uuid()}`);

      const upload = uploadBytesResumable(storageRef, img).then(() => {
        getDownloadURL(storageRef).then((url) => {
          console.log(url);

          addDoc(collection(db, "rooms", currentRoom, "messages"), {
            uid,
            photoURL,
            createdAt,
            text: message,
            room: currentRoom,
            user: displayName,
            img: url,
          });
        });
      });
    } else {
      await addDoc(collection(db, "rooms", currentRoom, "messages"), {
        uid,
        photoURL,
        createdAt,
        text: message,
        room: currentRoom,
        user: displayName,
      });
    }

    setMessage("");
    setImg(null);
    customRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chatRoom">
      <div className="chatRoom__info">{currentRoom}</div>
      <div className="chatRoom__messages">
        {messages?.map((message) => (
          <Message message={message} key={message.createdAt} />
        ))}
        <span ref={customRef}></span>
      </div>
      <div className="chatRoom__input">
        <form onSubmit={handleSend}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="say something nice"
          />
          <input
            type="file"
            // style={{ display: "none" }}
            id="chatRoom__file"
            accpet="image/*"
            onChange={(e) => setImg(e.target.files[0])}
          />
          <label htmlFor="chatRoom__file">
            {img ? (
              <Check sx={{ color: `var(--red-color)` }} />
            ) : (
              <AddPhotoAlternate />
            )}
          </label>

          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
