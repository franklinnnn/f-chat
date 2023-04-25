import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useState } from "react";
import { db, storage } from "../../firebase";
import { v4 as uuid } from "uuid";
import { AddPhotoAlternate, Check, Close } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

const AddRoom = ({ setAddRoom }) => {
  const [roomName, setRoomName] = useState("");
  const [roomImg, setRoomImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    setLoading(true);
    e.preventDefault();

    const roomId = uuid();

    if (roomImg) {
      const storageRef = ref(storage, `rooms/${roomId}`);

      const upload = uploadBytesResumable(storageRef, roomImg).then(() => {
        getDownloadURL(storageRef).then((url) => {
          console.log(url);
          setDoc(doc(db, "rooms", roomId), {
            uid: roomId,
            name: roomName,
            photoURL: url,
          });

          addDoc(collection(db, "rooms", roomId, "messages"), {});
          console.log(`added new room: ${roomName}`);
          setAddRoom(false);
        });
      });
    }

    // create room
    await setDoc(doc(db, "rooms", roomId), {
      uid: roomId,
      name: roomName,
    });
    // add collection for messages in room
    await addDoc(collection(db, "rooms", roomId, "messages"), {});
    console.log(`added new room: ${roomName}`);
    setAddRoom(false);
    setLoading(false);
  };

  return (
    <div className="addRoom">
      <div className="addRoom__header">
        Add new room <Close onClick={() => setAddRoom(false)} />
      </div>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="room name"
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
        />
        <input
          type="file"
          style={{ display: "none" }}
          id="addRoom__file"
          accept="image/*"
          onChange={(e) => setRoomImg(e.target.files[0])}
        />
        <label htmlFor="addRoom__file">
          <AddPhotoAlternate />{" "}
          {loading ? (
            <CircularProgress size={"26px"} />
          ) : (
            <>
              {roomImg ? (
                <Check sx={{ color: `var(--red-color)` }} />
              ) : (
                <span>Add room image</span>
              )}
            </>
          )}
        </label>
        <button disabled={!roomName}>Add</button>
      </form>
    </div>
  );
};

export default AddRoom;
