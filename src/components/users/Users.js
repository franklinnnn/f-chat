import React, { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { v4 as uuid } from "uuid";
import "./users.css";

const Users = ({ currentDm, setCurrentDm, setShowChatMessages }) => {
  const q = query(collection(db, "users"));
  const [currentUser] = useAuthState(auth);

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    const getUsers = () => {
      const unsub = onSnapshot(collection(db, "users"), (doc) => {
        let users = [];
        doc.docs.forEach((doc) => {
          users.push({ ...doc.data(), id: doc.id });
        });
        setUsers(users);
      });

      return () => {
        unsub();
      };
    };
    getUsers();
  }, []);

  const handleSelectUser = (uid) => {
    console.log(`shows user info card ${user}`);
    setShowUserInfo(true);
  };

  return (
    <div className="users">
      <div className="users__header">
        Users {"("}
        {users.length}
        {")"}
      </div>
      {users
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .map((user) => (
          <User
            user={user}
            key={user.uid}
            currentUser={currentUser}
            currentDm={currentDm}
            setCurrentDm={setCurrentDm}
            setShowChatMessages={setShowChatMessages}
          />
        ))}
    </div>
  );
};

// user card
const User = ({
  user,
  currentUser,
  currentDm,
  setCurrentDm,
  setShowChatMessages,
}) => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  return (
    <div
      className="user"
      key={user.uid}
      ref={ref}
      onClick={() => setIsComponentVisible(true)}
    >
      {isComponentVisible && (
        <UserDetail
          user={user}
          currentUser={currentUser}
          currentDm={currentDm}
          setCurrentDm={setCurrentDm}
          setShowChatMessages={setShowChatMessages}
        />
      )}
      <div
        className="user__info"
        style={{ display: isComponentVisible ? "none" : "flex" }}
      >
        <img src={user.photoURL} alt="" />
        <span>{user.displayName}</span>
      </div>
    </div>
  );
};

// user detail when selected
const UserDetail = ({
  user,
  currentUser,
  currentDm,
  setCurrentDm,
  setShowChatMessages,
}) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const createdAt = serverTimestamp();
    const { uid, photoURL, displayName } = currentUser;

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    // get direct messages from database
    const res = await getDoc(doc(db, "directMessages", combinedId));

    // create direct message in database if it doesn't exist
    if (!res.exists()) {
      await setDoc(doc(db, "directMessages", combinedId), {
        uid: uuid(),
        users: [currentUser.displayName, user.displayName],
      });
      await addDoc(
        collection(db, "directMessages", combinedId, "messages"),
        {}
      );

      // update list of direct messages for both users
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

    // add new direct message to messages collection
    await addDoc(collection(db, "directMessages", combinedId, "messages"), {
      uid,
      photoURL,
      createdAt,
      text: message,
      user: displayName,
    });

    // update the last message sent/received for both users
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [combinedId + ".lastMessage"]: {
        message,
      },
      [combinedId + ".date"]: serverTimestamp(),
    });
    await updateDoc(doc(db, "userChats", user.uid), {
      [combinedId + ".lastMessage"]: {
        message,
      },
      [combinedId + ".date"]: serverTimestamp(),
    });
    console.log(
      `sent message "${message}" from ${currentUser.displayName} to ${user.displayName}`
    );
    setMessage("");
    // change current chat to messaged user and show chat window
    setCurrentDm({ ...currentDm, id: combinedId, user: user.displayName });
    setShowChatMessages(true);
  };

  // send direct message on pressing enter key
  const handleKey = (e) => {
    e.key === "Enter" && handleSendMessage();
  };

  return (
    <div className="userDetail">
      <div className="userDetail__container">
        <img src={user.photoURL} alt="" />
        <span>{user.displayName}</span>

        {user.uid !== currentUser.uid ? (
          <form onSubmit={handleSendMessage} className="userDetail__message">
            <input
              value={message}
              onKeyDown={handleKey}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`send message to ${user.displayName}`}
            />
          </form>
        ) : null}
      </div>
    </div>
  );
};

// handle closing user details window when clicking outside it
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

export default Users;
