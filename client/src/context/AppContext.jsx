import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Create context
export const AppContext = createContext();

// Provider component
export const AppContextProvider = ({ children }) => {
  // Ensure axios sends credentials (cookies, etc.)
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Safety check for missing backendUrl
  if (!backendUrl) {
    console.error("❌ VITE_BACKEND_URL is not defined in your .env file");
  }

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // Helper to safely construct URLs
  const buildUrl = (path) => {
    try {
      return new URL(path, backendUrl).toString();
    } catch (e) {
      console.error("❌ Invalid backend URL:", backendUrl);
      return "";
    }
  };

  // Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(buildUrl("/api/auth/is-auth"));
      if (data.success) {
        setIsLoggedin(true);
        getUserData(); // Fetch user data after auth success
      } else {
        setIsLoggedin(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      toast.error(
        error.response?.data?.message || error.message || "Auth error"
      );
    }
  };

  // Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(buildUrl("/api/user/data"));
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Failed to load user data");
      }
    } catch (error) {
      console.error("User data fetch failed:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error fetching user data"
      );
    }
  };

  // Run once when the component mounts
  useEffect(() => {
    console.log("✅ Checking auth state...");
    getAuthState();
  }, []);

  // Expose values and functions to the rest of the app
  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
