import { Close } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "../../firebase";

const EditEmail = ({ user, setShowEditEmail }) => {
  const [newEmail, setNewEmail] = useState("");
  const [showReauthenticate, setShowReauthenticate] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleEditEmail = async () => {
    setLoading(true);
    try {
      if (newEmail) {
        await updateEmail(auth.currentUser, newEmail)
          .then(() => {
            console.log(`email updated to ${newEmail}`);
          })
          .catch((error) => {
            setError(true);
          });
        const res = await getDoc(doc(db, "users", user.uid));
        if (res.exists()) {
          await updateDoc(doc(db, "users", user.uid), {
            email: newEmail,
          });
        }
      }
    } catch (error) {
      setError(true);
    }
    setNewEmail("");
    setShowEditEmail(false);
    setLoading(false);
  };

  const handleReauthenticate = async () => {
    setLoading(true);
    const password = enteredPassword;
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    const result = await reauthenticateWithCredential(
      auth.currentUser,
      credential
    ).then(() => {
      console.log("user reauthenticatd");
      handleEditEmail();
    });
    setLoading(false);
  };

  return (
    <div className="profile__edit">
      {showReauthenticate ? (
        <div
          className="profile__edit profile__reauthenticate"
          style={{ width: "100%" }}
        >
          <input
            type="password"
            placeholder="enter password to edit"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
          />
          <button onClick={handleReauthenticate} disabled={!enteredPassword}>
            OK
          </button>
          <Close onClick={() => setShowEditEmail(false)} />
        </div>
      ) : (
        <>
          <input
            type="email"
            placeholder={user.email}
            onChange={(e) => setNewEmail(e.target.value)}
            value={newEmail}
          />
          <div className="profile__editButtons">
            {loading ? (
              <CircularProgress size={"26px"} />
            ) : (
              <button
                onClick={() => setShowReauthenticate(true)}
                disabled={!newEmail}
              >
                save
              </button>
            )}
            <Close onClick={() => setShowEditEmail(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default EditEmail;
