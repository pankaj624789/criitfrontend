import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const allowedEmails = [
  "pnkjpndt@gmail.com",
  "pankaj.pandit@critips.com",
  "prosenjit.chatterjee@critips.com",
];

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!allowedEmails.includes(email)) {
      alert("This email is not authorized to access the system.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      alert("Login failed: " + error.message);
      return;
    }

    alert("Magic login link sent to your email!");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>IT Portal Login</h2>

        {/* Email OTP Login */}
        <form onSubmit={handleEmailOTPLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending link..." : "Send Login Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #007BFF, #00BFFF)",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "320px",
  },
  title: { marginBottom: "20px", color: "#333" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    background: "#007BFF",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Login;

