import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-6 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg border">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${
              isActive
                ? "bg-green-500 text-white shadow"
                : "text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/create-trip"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${
              isActive
                ? "bg-green-500 text-white shadow"
                : "text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`
          }
        >
          Create Trip
        </NavLink>

        <NavLink
          to="/my-trips"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${
              isActive
                ? "bg-green-500 text-white shadow"
                : "text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`
          }
        >
          My Trips
        </NavLink>
      </div>
    </nav>
  );
}
