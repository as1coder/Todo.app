// components/LogoutButton.js
"use client";
import { toast } from "react-hot-toast";

export default function LogoutButton() {
  const confirmLogout = () => {
  toast((t) => (
    <div className="flex flex-col gap-3 p-3 rounded-lg shadow-lg bg-white border border-gray-200">
      <span className="text-gray-700 font-medium">Are you sure you want to logout?</span>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            toast.dismiss(t.id); // close popup
            localStorage.removeItem("token"); 
            window.location.href = "/login"; // ya navigate("/login")
          }}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  ), {
    duration: 8000, // thoda zyada time
    position: "top-center", // center me card feel
    id: "logout-toast"
  });
};
  return (
    <button
      onClick={confirmLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}