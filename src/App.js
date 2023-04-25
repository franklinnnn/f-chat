import React from "react";
import "./app.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// const App = () => {
//   const { currentUser } = useContext(AuthContext);

//   const ProtectedRoute = ({ children }) => {
//     if (!currentUser) {
//       return <Navigate to="/login" />;
//     }

//     return children;
//   };

//   return (
//     <div className="app">
//       <section className="app__container">
//         <BrowserRouter>
//           <Routes>
//             <Route path="/">
//               <Route
//                 index
//                 element={
//                   <ProtectedRoute>
//                     <Home />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route path="login" element={<Login />} />
//               <Route path="register" element={<Register />} />
//             </Route>
//           </Routes>
//         </BrowserRouter>
//       </section>
//     </div>
//   );
// };

const App = () => {
  const [user] = useAuthState(auth);

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/signin" />;
    }
    return children;
  };

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route
              index
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
