// src/App.tsx
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import MakePicks from "./pages/MakePicks";
import AllPicks from "./pages/AllPicks";
import Navbar from "./components/Navbar";

function RequireAuth() {
  const user = localStorage.getItem("username");
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <>
      <div className="header">
        <p>NFL Pick 'Em</p>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/picks" replace />} />
            <Route path="/picks" element={<MakePicks />} />
            <Route path="/all-picks" element={<AllPicks />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={<div style={{ padding: 20 }}>Not Found</div>}
        />
      </Routes>
    </>
  );
}
