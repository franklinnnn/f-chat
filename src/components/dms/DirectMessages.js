import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { v4 as uuid } from "uuid";
import "./dms.css";

const DirectMessages = ({ currentDm, setCurrentDm, setShowChatMessages }) => {
  const [currentUser] = useAuthState(auth);

  const [directMessages, setDirectMessages] = useState([]);

  useEffect(() => {
    const getDirectMessages = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setDirectMessages(doc.data());
      });

      return () => {
        unsub();
      };
    };
    currentUser.uid && getDirectMessages();
  }, [currentUser.uid]);

  const handleSelect = async (user) => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    setCurrentDm({ ...currentDm, id: combinedId, user: user.displayName });

    const res = await getDoc(doc(db, "directMessages", combinedId));

    if (!res.exists()) {
      await updateDoc(doc(db, "directMessages", combinedId), {
        uid: uuid(),
        users: [currentUser.displayName, user.displayName],
        messages: [],
      });
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [combinedId + ".userInfo"]: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        [combinedId + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "userChats", user.uid), {
        [combinedId + ".userInfo"]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        },
        [combinedId + ".date"]: serverTimestamp(),
      });
    }
    setShowChatMessages(true);
  };

  console.log(directMessages);
  return (
    <div className="directMessages">
      <h1>Direct Messages</h1>
      {Object.entries(directMessages)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((directMessage) => (
          <div
            className={
              currentDm === `${directMessage[1].userInfo.displayName}`
                ? "room__active"
                : "directMessage__user"
            }
            key={directMessage[0]}
            onClick={() => handleSelect(directMessage[1].userInfo)}
          >
            <img src={directMessage[1].userInfo.photoURL} alt="" />
            <div className="directMessage__info">
              <span>{directMessage[1].userInfo.displayName}</span>
              <p>{directMessage[1].lastMessage.message}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default DirectMessages;
