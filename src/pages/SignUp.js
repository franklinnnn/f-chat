import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { AddPhotoAlternate, Check } from "@mui/icons-material";
import { v4 as uuid } from "uuid";

const SignUp = () => {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      //Create a unique image name
      const storageRef = ref(storage, `users/${displayName + uuid()}`);

      await uploadBytesResumable(storageRef, avatar).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            //create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (error) {
            setError(true);
            setLoading(false);
            setErrorMsg(error.message);
          }
        });
      });
    } catch (error) {
      setError(true);
      setLoading(false);
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="signUp">
      <div className="form">
        <div className="form__wrapper">
          <div className="form__logo">
            <span>F</span> Chat
          </div>
          <div className="form__title">Sign Up</div>
          {loading ? (
            <div className="form__loading">
              <CircularProgress />
              <span>Creating user...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input required type="text" placeholder="display name" />
              <input required type="email" placeholder="email" />
              <input required type="password" placeholder="password" />
              <input
                style={{ display: "none" }}
                type="file"
                id="signUp__file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
              <label htmlFor="signUp__file">
                <AddPhotoAlternate />
                {avatar ? (
                  <Check sx={{ color: `var(--red-color)` }} />
                ) : (
                  <span>Add an avatar</span>
                )}
              </label>
              <button className="form__button">Sign up</button>

              {error && <span>{error.message}</span>}
            </form>
          )}

          {error && <p>{errorMsg}</p>}
          <div className="form__redirect">
            Have an account? <Link to="/signin">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
