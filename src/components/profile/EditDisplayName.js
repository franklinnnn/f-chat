import { Close } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "../../firebase";

const EditDisplayName = ({ user, setShowEditName }) => {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleEditName = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (newName) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
        })
          .then(() => {
            console.log(`displayName updated ${newName}`);
          })
          .catch((error) => {
            setError(true);
          });

        const res = await getDoc(doc(db, "users", user.uid));
        if (res.exists()) {
          await updateDoc(doc(db, "users", user.uid), {
            displayName: newName,
          });
        }
      }
    } catch (error) {
      setError(true);
    }
    setNewName("");
    setShowEditName(false);
    setLoading(false);
  };

  return (
    <div className="profile__edit">
      <input
        type="text"
        placeholder={user.displayName}
        onChange={(e) => setNewName(e.target.value)}
        value={newName}
      />
      {error && <span>{error.message}</span>}
      <div className="profile__editButtons">
        {loading ? (
          <CircularProgress size={"26px"} />
        ) : (
          <button onClick={handleEditName} disabled={!newName}>
            save
          </button>
        )}

        <Close onClick={() => setShowEditName(false)} />
      </div>
    </div>
  );
};

export default EditDisplayName;
