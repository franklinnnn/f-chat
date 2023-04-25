import React, { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Profile from "./profile/Profile";

const Nav = ({ user }) => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);
  const [showProfile, setShowProfile] = useState(false);
  return (
    <nav className="nav">
      <div className="nav__logo">
        <span>F</span> Chat
      </div>
      <div className="nav__user">
        <div
          className="nav__menuButton"
          ref={ref}
          onClick={() => setIsComponentVisible(true)}
        >
          <img src={user.photoURL} alt="" />
          {isComponentVisible && (
            <NavMenu
              user={user}
              showProfile={showProfile}
              setShowProfile={setShowProfile}
            />
          )}
        </div>
        {showProfile && <Profile user={user} setShowProfile={setShowProfile} />}
      </div>
    </nav>
  );
};

const NavMenu = ({ user, setShowProfile }) => {
  return (
    <div className="nav__menu">
      <div className="nav__userInfo">
        <img src={user.photoURL} alt="" />
        <h4>{user.displayName}</h4>
        <span>{user.email}</span>
      </div>
      <ul>
        <li onClick={() => setShowProfile(true)}>Profile</li>
        <li onClick={() => signOut(auth)}>Sign Out</li>
      </ul>
    </div>
  );
};

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

export default Nav;
