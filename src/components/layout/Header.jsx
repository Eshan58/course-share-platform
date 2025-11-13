import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      // console.error("Logout error:", error);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="navbar bg-base-100 shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        {/* Logo */}
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
            CourseShare
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-none hidden md:flex">
          <ul className="menu menu-horizontal px-1 space-x-2">
            <li>
              <Link
                to="/"
                className="font-semibold hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="font-semibold hover:text-primary transition-colors"
              >
                Courses
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/dashboard"
                  className="font-semibold hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Right Side Items */}
        <div className="flex-none flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Buttons */}
          {user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-8 rounded-full">
                  <img
                    alt="User avatar"
                    src={user.photoURL || "/default-avatar.png"}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/profile" className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </Link>
                </li>
                <li>
                  <Link to="/my-courses">My Courses</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="dropdown dropdown-end md:hidden">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/courses">Courses</Link>
              </li>
              {user && (
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
              )}
              {user ? (
                <>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <Link to="/my-courses">My Courses</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                  <li>
                    <Link to="/register">Sign Up</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
