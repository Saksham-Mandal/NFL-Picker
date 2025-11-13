import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, getPick } from "../util/api";
import { WEEK, GAME_ID } from "../util/constants";

export default function Login() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") ?? ""
  );
  const [status, setStatus] = useState("");
  const nav = useNavigate();
  const from = (useLocation() as any).state?.from?.pathname || "/picks";

  async function handleLogin() {
    try {
      if (!username.trim()) return setStatus("Enter a username.");
      setStatus("Logging in...");
      await login(username.trim());
      localStorage.setItem("username", username.trim());

      // optional: prefetch existing pick so MakePicks can render immediately
      await getPick(username.trim(), WEEK, GAME_ID);

      nav(from, { replace: true });
    } catch (e: any) {
      setStatus(e.message || "Login failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      />
      <button onClick={handleLogin}>Log In</button>
      <div style={{ marginTop: 10, opacity: 0.8 }}>{status}</div>
    </div>
  );
}
