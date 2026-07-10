import React, { useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";

export default function Chat() {

  const [query, setQuery] = useState("")
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  // const [sessionId, setSessionId] = useState(null);
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [selectedChat, setSelectedChat] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {

    const user_id = localStorage.getItem("user_id");

    const res = await API.get(
      `/chats/${user_id}`
    );

    setSessions(res.data);
  };

  const createChat = async () => {

    const user_id = localStorage.getItem("user_id");
    const title = `Chat ${sessions.length + 1}`;

    // if (!title) return;

    const res = await API.post(
      "/new_chat",
      {
        title,
        user_id
      }
    );

    // setSessionId(res.data.session_id);
    navigate(`/chat/${res.data.session_id}`);
    // setSelectedChat(res.data.session_id);

    setHistory([]);

    loadChats();
  };

  const deleteChat = async (id) => {

    const confirmed = window.confirm(
      "Delete this chat?"
    );

    if (!confirmed) return;

    await API.delete(
      `/delete_chat/${id}`
    );

    if (sessionId === id) {
      // setSessionId(null);
      setSelectedChat(null);
      setHistory([]);
      setAnswer("");
    }

    loadChats();
  };

  const renameChat = async (id) => {

    if (!newTitle.trim()) return;

    await API.put(
      `/rename_chat/${id}`,
      {
        title: newTitle
      }
    );

    setEditingChat(null);
    setNewTitle("");
    loadChats();
  };

  const loadHistory = async () => {

    if (!sessionId) return;

    const res = await API.get(
      `/history/${sessionId}`
    );

    setHistory(res.data);
  };

  // useEffect(() => {
  //   if (sessionId) {
  //     loadHistory();
  //   }
  // }, [sessionId]);

  // useEffect(() => {
  //   const loadHistory = async () => {
  //     if (!sessionId) return;
  //     const res = await API.get(
  //       `/history/${sessionId}`
  //     );
  //     setHistory(res.data);
  //   };
  //   loadHistory();
  // }, [sessionId]);
  
  useEffect(() => {
    if (!sessionId) return;

    const loadHistory = async () => {
      try {
        const res = await API.get(`/history/${sessionId}`);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadHistory();
  }, [sessionId]);

  // const openChat = async (id) => {

  //   setSelectedChat(id);
  //   setSessionId(id);

  //   const res = await API.get(
  //     `/history/${id}`
  //   );

  //   setHistory(res.data);
  // };

  const openChat = (id) => {
    navigate(`/chat/${id}`);
  };

  const askQuestion = async () => {
    const user_id = localStorage.getItem("user_id");

    if (!sessionId) {
      alert("Create or select a chat first");
      return;
    }

    if (!query) return;

    setLoading(true);
    
    try {
      await API.post(
        "/query",
        {
          query,
          user_id,
          session_id: Number(sessionId)
        }
      );
      
      setQuery("");
      await loadHistory();

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  return (

    <div style={{
      display: "flex",
      height: "calc(100vh - 55px)",
      fontFamily: "Arial, Helvetica, sans-serif",
      background: "#121212",
    }}>

      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          minWidth: "260px",
          borderRight: "1px solid #2a2a2a",
          padding: "16px",
          background: "#161616",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
         <button
          onClick={createChat}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            background: "#3a3a3a",
            color: "#e0e0e0",
            border: "1px solid #4a4a4a",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            fontFamily: "Arial, Helvetica, sans-serif",
            transition: "background 0.2s",
          }}
        >
          New Chat
        </button>

        {sessions.map(chat => (

          <div
            key={chat.id}
            style={{
              marginBottom: "6px",
              padding: "10px 12px",
              borderRadius: "8px",
              background:
                Number(sessionId) === chat.id
                  ? "#2d2d44"
                  : "transparent",
              transition: "background 0.15s",
              cursor: "pointer",
            }}
          >

            {editingChat === chat.id ? (

              <div>

                <input
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(e.target.value)
                  }
                  style={{
                    width: "95%",
                    padding: "6px 8px",
                    background: "#1e1e1e",
                    border: "1px solid #444",
                    borderRadius: "6px",
                    color: "#e0e0e0",
                    fontSize: "13px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    outline: "none",
                  }}
                />

                <button
                  onClick={() =>
                    renameChat(chat.id)
                  }
                  style={{
                    marginTop: "6px",
                    padding: "5px 12px",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  Save
                </button>

              </div>

            ) : (

              <div
                onClick={() => openChat(chat.id)}
                style={{
                  cursor: "pointer",
                  color: Number(sessionId) === chat.id ? "#e0e0e0" : "#a0a0a0",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {chat.title}
              </div>

            )}

            {Number(sessionId) === chat.id && (

              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "6px"
                }}
              >

                <button
                  onClick={() => {
                    setEditingChat(chat.id);
                    setNewTitle(chat.title);
                  }}
                  style={{
                    padding: "4px 10px",
                    background: "#2a2a2a",
                    color: "#b0b0b0",
                    border: "1px solid #3a3a3a",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  Rename
                </button>

                <button
                  onClick={() =>
                    deleteChat(chat.id)
                  }
                  style={{
                    padding: "4px 10px",
                    background: "#2a2a2a",
                    color: "#e06060",
                    border: "1px solid #3a3a3a",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  Delete
                </button>

              </div>

            )}

          </div>

        ))}

      </div>

      {/* Main Chat */}
      <div
        style={{
          flex: 1,
          padding: "0",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#121212",
        }}
      >

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >

          {history.length === 0 && !sessionId && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#555",
              fontSize: "16px",
            }}>
              Select or create a chat to get started
            </div>
          )}

          {history.map((chat) => (
            <div
              key={chat.id}
              style={{
                marginTop: "12px",
                padding: "14px 18px",
                background: "#1e1e1e",
                borderRadius: "10px",
                border: "1px solid #2a2a2a",
              }}
            >
              <p style={{ color: "#c0c0d0", marginBottom: "10px", lineHeight: "1.5" }}>
                <strong style={{ color: "#8b8bf5" }}>You:</strong> {chat.question}
              </p>

              <p style={{ color: "#b0b0b0", lineHeight: "1.5" }}>
                <strong style={{ color: "#6366f1" }}>Assistant:</strong> {chat.answer}
              </p>

            </div>
          ))}

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "16px 24px",
            borderTop: "1px solid #2a2a2a",
            background: "#161616",
            alignItems: "flex-end",
          }}
        >

          {loading && (
            <div
              style={{
                padding: "10px 16px",
                marginBottom: "10px",
                background: "#1e1e1e",
                borderRadius: "8px",
                fontStyle: "italic",
                color: "#8888aa",
                fontSize: "14px",
                border: "1px solid #2a2a2a",
              }}
            >
              Thinking...
            </div>
          )}
          
          <textarea
            rows="1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Your question here..."
            style={{
              flex: 1,
              padding: "12px 16px",
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: "10px",
              color: "#e0e0e0",
              fontSize: "14px",
              fontFamily: "Arial, Helvetica, sans-serif",
              resize: "none",
              outline: "none",
            }}
          />

          <button
            onClick={askQuestion}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading ? "#3a3a5a" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "Arial, Helvetica, sans-serif",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            Ask
          </button>

        </div>

      </div>

    </div>
  )
}