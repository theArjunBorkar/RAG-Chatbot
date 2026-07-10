import React from "react"
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (!email.trim()) {
        alert("Email is required");
        return;
      }

      if (!password.trim()) {
        alert("Password is required");
        return;
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

      if (!passwordRegex.test(password)) {
        alert(
          "Password must contain:\n" +
          "- 8+ characters\n" +
          "- Uppercase letter\n" +
          "- Lowercase letter\n" +
          "- Number\n" +
          "- Special character"
        );
        return;
      }
      
      const res = await axios.post(
        isSignup
          ? "http://127.0.0.1:8000/signup"
          : "http://127.0.0.1:8000/login",
        {
          email,
          password,
        }
      );

      alert(res.data.message);

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("user", email);

      window.location.href = "/chat";
    } catch (err) {
      alert("Server Error");
      console.log(err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 60px)",
        flexDirection: "column",
        fontFamily: "Arial, Helvetica, sans-serif",
        background: "#121212",
        padding: "20px",
      }}
    >

      <h1
        style={{
          color: "#e0e0e0",
          fontSize: "26px",
          fontWeight: "600",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        Ask any question related to Government Schemes
      </h1>

      <h2
        style={{
          color: "#9090a0",
          fontSize: "20px",
          fontWeight: "400",
          marginBottom: "28px",
        }}
      >
        {isSignup ? "Signup" : "Login"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          marginBottom: "12px",
          padding: "12px 16px",
          width: "320px",
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: "10px",
          color: "#e0e0e0",
          fontSize: "15px",
          fontFamily: "Arial, Helvetica, sans-serif",
          outline: "none",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          marginBottom: "16px",
          padding: "12px 16px",
          width: "320px",
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: "10px",
          color: "#e0e0e0",
          fontSize: "15px",
          fontFamily: "Arial, Helvetica, sans-serif",
          outline: "none",
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          padding: "12px 20px",
          marginBottom: "12px",
          cursor: "pointer",
          width: "352px",
          background: "#6366f1",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: "600",
          fontFamily: "Arial, Helvetica, sans-serif",
          transition: "background 0.2s",
        }}
      >
        {isSignup ? "Signup" : "Login"}
      </button>

      <button
        onClick={() => setIsSignup(!isSignup)}
        style={{
          padding: "10px 15px",
          cursor: "pointer",
          width: "352px",
          background: "transparent",
          color: "#8888aa",
          border: "1px solid #333",
          borderRadius: "10px",
          fontSize: "14px",
          fontFamily: "Arial, Helvetica, sans-serif",
          transition: "border-color 0.2s, color 0.2s",
        }}
      >
        Switch to {isSignup ? "Login" : "Signup"}
      </button>
    </div>
  );
}