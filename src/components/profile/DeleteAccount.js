import { Close } from "@mui/icons-material";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import React, { useState } from "react";
import { auth, db, storage } from "../../firebase";

const DeleteAccount = ({ user, setShowDeleteAccount }) => {
  const [showReauthenticate, setShowReauthenticate] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");

  const handleDeleteUser = async () => {
    await deleteUser(auth.currentUser)
      .then(() => {
        deleteDoc(doc(db, "users", user.uid));
        deleteDoc(doc(db, "userChats", user.uid));
        const storageRef = ref(storage, `users/${user.uid}`);
        deleteObject(storageRef);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleReauthenticate = async () => {
    const password = enteredPassword;
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    const result = await reauthenticateWithCredential(
      auth.currentUser,
      credential
    ).then(() => {
      handleDeleteUser();
    });
  };

  // const Reauthenticate = () => {
  //   const handleReauthenticate = async (e) => {
  //     const password = setValue(e.target.value);
  //     const credential = EmailAuthProvider.credential(
  //       auth.currentUser,
  //       password
  //     );
  //     const result = await reauthenticateWithCredential(
  //       auth.currentUser,
  //       credential
  //     ).then(() => {
  //       handleDeleteUser();
  //     });
  //   };

  //   return (
  //     <div
  //       className="profile__edit profile__reauthenticate"
  //       style={{ width: "100%" }}
  //     >
  //       <input type="password" placeholder="enter password" value={value} />
  //       <button onClick={handleReauthenticate} disabled={!value}>
  //         OK
  //       </button>
  //       <Close onClick={() => setShowDeleteAccount(false)} />
  //     </div>
  //   );
  // };
  return (
    <div className="profile__deleteAccount">
      <h4>Delete account?</h4>
      {showReauthenticate ? (
        <div
          className="profile__edit profile__reauthenticate"
          style={{ width: "100%" }}
        >
          <input
            type="password"
            placeholder="enter password to delete"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
          />
          <button onClick={handleReauthenticate} disabled={!enteredPassword}>
            OK
          </button>
          <Close onClick={() => setShowDeleteAccount(false)} />
        </div>
      ) : (
        <div className="profile__deleteAccountButtons">
          <button
            className="deleteButton"
            onClick={() => setShowReauthenticate(true)}
          >
            Delete
          </button>
          <button
            className="cancelButton"
            onClick={() => setShowDeleteAccount(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
