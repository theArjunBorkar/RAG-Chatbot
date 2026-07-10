import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Database from "./pages/Database";
import "./index.css";

function Navbar() {
  const isLoggedIn = localStorage.getItem("user");

  return (
    <div
      style={{
        padding: "14px 24px",
        background: "#1a1a2e",
        display: "flex",
        gap: "24px",
        alignItems: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        borderBottom: "1px solid #2a2a3e",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#c0c0d0",
          textDecoration: "none",
          fontSize: "15px",
          fontWeight: "500",
          transition: "color 0.2s",
        }}
      >
        Login
      </Link>

      {isLoggedIn && (
        <>
          <Link
            to="/chat"
            style={{
              color: "#c0c0d0",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "500",
            }}
          >
            Chat
          </Link>

          <Link
            to="/database"
            style={{
              color: "#c0c0d0",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "500",
            }}
          >
            Database
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("user_id");
              window.location.href = "/";
            }}
            style={{
              marginLeft: "auto",
              padding: "8px 20px",
              cursor: "pointer",
              background: "#3a3a3a",
              color: "#e0e0e0",
              border: "1px solid #4a4a4a",
              borderRadius: "10px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/database" element={<Database />} />
      </Routes>
    </BrowserRouter>
  );
}