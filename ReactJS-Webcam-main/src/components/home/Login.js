// frontend/src/components/home/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password
      });

      // Assuming the response contains a token
      const { token } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Redirect to home page
      navigate("/home");
    } catch (error) {
      console.error("Error logging in", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            style={styles.registerButton}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px"
  },
  header: {
    marginBottom: "20px",
    fontSize: "2em",
    color: "#333"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "300px"
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1em"
  },
  button: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "1em",
    cursor: "pointer"
  },
  footer: {
    marginTop: "20px"
  },
  footerText: {
    fontSize: "1em",
    color: "#333"
  },
  registerButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "0"
  }
};

export default Login;
