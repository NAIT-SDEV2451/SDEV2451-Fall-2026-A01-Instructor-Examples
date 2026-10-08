import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"


export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return <nav className="navbar bg-base-100 shadow px-6">
    <div className="flex-1">
      <span className="text-xl font-bold">Ticketmono</span>
    </div>
    <div className="flex gap-4">
      {/* This can be shown to users that are logged or not. */}
      <NavLink to="/" className="btn btn-ghost btn-sm">
        Events
      </NavLink>
      {user ?
        <>
          {/* if the user is logged in I want to show the name, and logout button */}
          <span className="text-sm text-base-content/60 mt-2">
            Hi {user.username}
          </span>
          <button className="btn btn-ghost btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
        : <>
          {/* Login/Register should be shown to users that are not logged in */}
          <NavLink to="/login" className="btn btn-ghost btn-sm">
            Login
          </NavLink>
          <NavLink to="/register" className="btn btn-primary btn-sm">
            Register
          </NavLink>
        </>
      }

    </div>
  </nav>
}