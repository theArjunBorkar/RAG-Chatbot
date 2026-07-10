import React, { useEffect, useState } from "react"
import API from "../api"
import axios from "axios"

export default function Database() {

  const [files, setFiles] = useState([])
  const [vectors, setVectors] = useState([])

  // ---------------- LOAD VECTOR DATA ----------------

  const loadVectors = async () => {
    try {
      const response = await API.get("/vectors")
      setVectors(response.data.documents || [])
    } catch (error) {
      console.log(error)
    }
  }

  // ---------------- PDF UPLOAD ----------------

  const uploadPDF = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await API.post(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      alert(response.data.message)

      setFiles(prev => [...prev, file.name])

      loadVectors()
    } catch (error) {
      console.log(error)
      alert("Upload failed")
    }
  }

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {
    loadVectors()
  }, [])
  return (

    <div style={{
      padding: "30px",
      minHeight: "calc(100vh - 55px)",
      background: "#121212",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>

      {/* ---------------- FILE DATABASE ---------------- */}

      <div
        style={{
          marginTop: "20px",
          padding: "24px",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          background: "#1e1e1e",
        }}
      >

        <h2 style={{ color: "#e0e0e0", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
          Uploaded PDFs
        </h2>

        <label
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#6366f1",
            color: "#fff",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            fontFamily: "Arial, Helvetica, sans-serif",
            transition: "background 0.2s",
          }}
        >
          Choose PDF
          <input
            type="file"
            accept=".pdf"
            onChange={uploadPDF}
            style={{ display: "none" }}
          />
        </label>

        <ul style={{ marginTop: "16px", paddingLeft: "20px" }}>

          {files.map((file, index) => (

            <li
              key={index}
              style={{
                color: "#b0b0b0",
                padding: "6px 0",
                fontSize: "14px",
              }}
            >
              {file}
            </li>

          ))}

        </ul>

      </div>

      {/* ---------------- VECTOR DATABASE ---------------- */}

      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          background: "#1e1e1e",
        }}
      >

        <h2 style={{ color: "#e0e0e0", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
          Vector Database (Summaries)
        </h2>

        {

          vectors.length === 0

          ?

          <p style={{ color: "#666", fontSize: "14px" }}>No summaries stored yet.</p>

          :

          vectors.map((item, index) => (

            <div
              key={index}
              style={{
                marginBottom: "12px",
                padding: "14px 18px",
                background: "#2a2a2a",
                borderRadius: "10px",
                color: "#b0b0b0",
                fontSize: "14px",
                lineHeight: "1.6",
                border: "1px solid #333",
              }}
            >

              {item}

            </div>

          ))
        }

      </div>

    </div>
  )
}

/*
import Navbar from "../components/Navbar";

export default function Database() {
  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Database Page</h1>
      </div>
    </div>
  );
}
*/