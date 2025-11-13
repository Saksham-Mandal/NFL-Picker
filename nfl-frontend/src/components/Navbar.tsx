// Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();
  const user = localStorage.getItem("username");

  const link = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">NFL Season Predictor</div>

        <nav className="nav">
          <NavLink to="/picks" className={link}>
            Make Picks
          </NavLink>
          <NavLink to="/all-picks" className={link}>
            All Picks
          </NavLink>
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              <span className="user">{user}</span>
              <button
                className="btn"
                onClick={() => {
                  localStorage.removeItem("username");
                  nav("/login", { replace: true });
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="nav-link active">
              Log In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
