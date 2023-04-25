import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setError(true);
      console.log(error.message);
      if (error.message === "Firebase: Error (auth/user-not-found)") {
        setErrorMsg("Email not found");
      } else if (error.message === "Firebase: Error (auth/wrong-password).") {
        setErrorMsg("Wrong password");
      } else {
        setErrorMsg(error.message);
      }
      console.log(errorMsg);
    }
  };
  return (
    <div className="form">
      <div className="form__wrapper">
        <div className="form__logo">
          <span>F</span> Chat
        </div>
        <div className="form__title">Login</div>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button>Login</button>
          {error && <span style={{ color: "red" }}>{errorMsg}</span>}
        </form>
        <div className="form__redirect">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
