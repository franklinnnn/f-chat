import { Close } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";

const ChangePassword = ({ setShowChangePassword }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = auth.currentUser;

  const handleChangePassword = async (e) => {
    setLoading(true);
    e.preventDefault();

    // const oldPassword = e.target[0].value;
    // const newPassword = e.target[1].value;
    // const confirmPassword = e.target[2].value;

    if (newPassword !== confirmPassword) {
      console.log(`password doesn't match`);
      setErrorMsg(`password doesn't match`);
    }

    try {
      const password = oldPassword;
      const credential = EmailAuthProvider.credential(user.email, password);
      const result = await reauthenticateWithCredential(user, credential).then(
        () => {
          updatePassword(user, newPassword)
            .then(() => {
              console.log("password updated");
            })
            .catch((error) => {
              setError(true);
              setErrorMsg(error.message);
            });
        }
      );
    } catch (error) {
      setError(true);
      setErrorMsg(error.message);
    }
    setShowChangePassword(false);
    setLoading(false);
  };

  return (
    <div className="profile__edit profile__passwordChange">
      <span>
        Change Password <Close onClick={() => setShowChangePassword(false)} />
      </span>

      <form onSubmit={handleChangePassword}>
        <label>Password</label>
        <input
          required
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <label>New password</label>
        <input
          requred
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <label>Confirm passowrd</label>
        <input
          required
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error ? <span>{errorMsg}</span> : null}
        {loading ? (
          <CircularProgress size={"26px"} />
        ) : (
          <button onClick={handleChangePassword} disabled={!newPassword}>
            save
          </button>
        )}
      </form>
    </div>
  );
};

export default ChangePassword;
