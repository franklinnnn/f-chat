import { AddPhotoAlternate, Check, Close } from "@mui/icons-material";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useState } from "react";
import { db, storage } from "../../firebase";

const RoomActions = ({ room, setCurrentRoom }) => {
  const [editRoom, setEditRoom] = useState(false);
  const [deleteRoom, setDeleteRoom] = useState(false);

  return (
    <div className="room__actions">
      {editRoom && <EditRoom room={room} setEditRoom={setEditRoom} />}
      {deleteRoom && (
        <DeleteRoom
          room={room}
          setDeleteRoom={setDeleteRoom}
          setCurrentRoom={setCurrentRoom}
        />
      )}
      <ul>
        <li onClick={() => setEditRoom(true)}>Edit room</li>
        <li onClick={() => setDeleteRoom(true)}>Delete room</li>
      </ul>
    </div>
  );
};

const EditRoom = ({ room, setEditRoom }) => {
  const [roomName, setRoomName] = useState("");
  const [roomImg, setRoomImg] = useState(null);

  const handleEdit = async (e) => {
    e.preventDefault();
    if (roomImg) {
      const storageRef = ref(storage, `rooms/${room.uid}`);
      deleteObject(storageRef);

      const upload = uploadBytesResumable(storageRef, roomImg).then(() => {
        getDownloadURL(storageRef).then((url) => {
          if (roomName === "") {
            updateDoc(doc(db, "rooms", room.uid), {
              photoURL: url,
            });
          } else {
            updateDoc(doc(db, "rooms", room.uid), {
              name: room.name,
              photoURL: url,
            });
          }
        });
      });
    } else {
      await updateDoc(doc(db, "rooms", room.uid), {
        name: roomName,
      });
    }
    setEditRoom(false);
  };

  return (
    <div className="addRoom editRoom">
      <div className="addRoom__header">
        Edit room
        <Close onClick={() => setEditRoom(false)} />
      </div>
      {room.photoURL ? <img src={room.photoURL} alt="" /> : null}
      <form>
        <input
          type="text"
          placeholder="room name"
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
        />
        <input
          type="file"
          style={{ display: "none" }}
          id="editRoom__file"
          accpet="image/*"
          onChange={(e) => setRoomImg(e.target.files[0])}
        />
        <label htmlFor="editRoom__file">
          <AddPhotoAlternate />{" "}
          {roomImg ? (
            <Check sx={{ color: `var(--red-color)` }} />
          ) : (
            <span>Change room image</span>
          )}
        </label>
        <div className="editRoom__buttons">
          <button onClick={handleEdit} disabled={!roomName}>
            Edit
          </button>
          <button onClick={() => setEditRoom(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const DeleteRoom = ({ room, setDeleteRoom, setCurrentRoom }) => {
  const handleDelete = () => {
    const storageRef = ref(storage, `rooms/${room.uid}`);
    deleteObject(storageRef);
    console.log(`deleted room ${room.name}`);
    deleteDoc(doc(db, "rooms", room.uid));
    setCurrentRoom("General");
  };
  return (
    <div className="addRoom deleteRoom">
      {room.name === "General" ? (
        <span>Default room cannot be deleted</span>
      ) : (
        <>
          <span>Delete {room.name}?</span>
          <div className="deleteRoom__buttons">
            <button onClick={handleDelete}>Delete</button>
            <button onClick={() => setDeleteRoom(false)}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomActions;
