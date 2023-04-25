import React, { useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import { v4 as uuid } from "uuid";
import { Check, Close } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import EditDisplayName from "./EditDisplayName";
import EditEmail from "./EditEmail";
import ChangePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";
import "./profile.css";

const Profile = ({ user, setShowProfile }) => {
  const [showEditName, setShowEditName] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChangeAvatar = async (e) => {
    setLoading(true);
    e.preventDefault();
    const file = user.displayName + uuid();
    const metadata = { contentType: "image/jpeg" };
    try {
      if (newAvatar) {
        const storageRef = ref(storage, `users/${file}`);

        const upload = uploadBytesResumable(storageRef, newAvatar, metadata)
          .then(() => {
            getDownloadURL(storageRef).then((url) => {
              console.log(url);

              updateProfile(auth.currentUser, {
                photoURL: url,
              });

              updateDoc(doc(db, "users", user.uid), {
                photoURL: url,
              });
            });
            console.log(`avatar updated`);
          })
          .catch((error) => {
            setError(true);
            setErrorMsg(error.message);
            console.log(error.message);
          });
      }
    } catch (error) {
      setError(true);
      setErrorMsg(error.message);
      console.log(error.message);
    }
    setNewAvatar(null);
    setLoading(false);
  };

  return (
    <div className="profile">
      <div className="profile__header">
        <span>Profile</span>
        <Close onClick={() => setShowProfile(false)} />
      </div>
      <div className="profile__section profile__avatar">
        <span>Avatar</span>
        <img src={user.photoURL} alt="" />
        {loading ? (
          <CircularProgress size={"26px"} />
        ) : (
          <div>
            <input
              type="file"
              style={{ display: "none" }}
              id="newAvatar__file"
              accept="image/*"
              onChange={(e) => setNewAvatar(e.target.files[0])}
            />
            <label htmlFor="newAvatar__file">
              {newAvatar ? (
                <Check sx={{ color: `var(--red-color)` }} />
              ) : (
                <div className="profile__avatarButton">Change avatar</div>
              )}
            </label>
            {newAvatar ? (
              <div
                className="profile__avatarButton"
                onClick={handleChangeAvatar}
              >
                save
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="profile__section profile__name">
        <span>display name</span>
        {showEditName && (
          <EditDisplayName user={user} setShowEditName={setShowEditName} />
        )}
        <div style={{ display: showEditName ? "none" : "flex" }}>
          <h4>{user.displayName}</h4>
          <button onClick={() => setShowEditName(true)}>edit</button>
        </div>
      </div>
      <div className="profile__section profile__email">
        <span>email</span>
        {showEditEmail && (
          <EditEmail user={user} setShowEditEmail={setShowEditEmail} />
        )}
        <div style={{ display: showEditEmail ? "none" : "flex" }}>
          <h4>{user.email}</h4>
          <button onClick={() => setShowEditEmail(true)}>edit</button>
        </div>
      </div>
      <div className="profile__section profile__password">
        {showChangePassword && (
          <ChangePassword setShowChangePassword={setShowChangePassword} />
        )}
        <div style={{ display: showChangePassword ? "none" : "flex" }}>
          <span>Password</span>
          <button onClick={() => setShowChangePassword(true)}>
            Change password
          </button>
        </div>
      </div>
      <div className="profile__section profile__delete">
        <button
          onClick={() => setShowDeleteAccount(true)}
          style={{ display: showDeleteAccount ? "none" : "block" }}
        >
          Delete account
        </button>
        {showDeleteAccount && (
          <DeleteAccount
            user={user}
            setShowDeleteAccount={setShowDeleteAccount}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
