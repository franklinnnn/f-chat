import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { auth, db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import Message from "./Message";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { AddPhotoAlternate, Check } from "@mui/icons-material";

const ChatMessages = ({ currentDm }) => {
  const customRef = useRef();

  const [message, setMessage] = useState("");
  const [img, setImg] = useState(null);

  const q = query(
    collection(db, "directMessages", currentDm.id, "messages"),
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
      const storageRef = ref(
        storage,
        `directMessages/${currentDm.id}/${uuid()}`
      );

      const upload = uploadBytesResumable(storageRef, img).then(() => {
        getDownloadURL(storageRef).then((url) => {
          console.log(url);

          addDoc(collection(db, "directMessages", currentDm.id, "messages"), {
            uid,
            photoURL,
            createdAt,
            text: message,
            user: displayName,
            img: url,
          });
        });
      });
    } else {
      await addDoc(collection(db, "directMessages", currentDm.id, "messages"), {
        uid,
        photoURL,
        createdAt,
        text: message,
        user: displayName,
      });
    }

    setMessage("");
    setImg(null);
    customRef.current.scrollIntoView({ behavior: "smooth" });

    await updateDoc(doc(db, "userChats", uid), {
      [currentDm.id + ".lastMessage"]: {
        message,
      },
      [currentDm.id + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", currentDm.uid), {
      [currentDm.id + ".lastMessage"]: {
        message,
      },
      [currentDm.id + ".date"]: serverTimestamp(),
    });
  };

  return (
    <div className="chatRoom chatRoom__dms">
      <div className="chatRoom__info">{currentDm.user}</div>
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
            id="chatMessages__file"
            accpet="image/*"
            onChange={(e) => setImg(e.target.files[0])}
          />
          <label htmlFor="chatMessages__file">
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

// const Message = ({ message, handleDelete }) => {
//   const { id, text, uid, username, createdAt, photoURL } = message;
//   const messageClass =
//     uid === auth.currentUser.uid ? "message__sent" : "message__received";
//   const [showActions, setShowActions] = useState(false);
//   const toggleActions = () => {
//     setShowActions(!showActions);
//   };

//   return (
//     <div className={`message ${messageClass}`}>
//       <div className="message__contents">
//         <div className="message__userInfo">
//           <span>{username}</span>
//           <img src={photoURL} alt="" />
//         </div>
//         <p>{text}</p>
//         <div
//           className="message__actions"
//           style={{
//             display:
//               showActions && uid === auth.currentUser.uid ? "block" : "none",
//           }}
//         >
//           <button onClick={() => handleDelete(createdAt, id)}>Delete</button>
//         </div>
//       </div>
//     </div>
//   );
// };

export default ChatMessages;
