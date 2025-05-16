import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Create context
export const AppContext = createContext();

// Provider component
export const AppContextProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  console.log("Backend URL", backendUrl);
  if (!backendUrl) {
    console.error("❌ VITE_BACKEND_URL is not defined in your .env file");
  }

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  const cleanEnvUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(
    /^['"]|['"]$/g,
    ""
  );
  console.log("🔧 Cleaned Backend URL:", cleanEnvUrl);

  const buildUrl = () => {
    try {
      // Remove trailing slash from env variable
      const cleanBase = cleanEnvUrl?.replace(/\/+$/, "");

      console.log("🛠 Final API URL:", cleanBase);
    } catch (e) {
      console.error("❌ Failed to build URL:", e.message);
      return "";
    }
  };

  // Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(buildUrl("/api/auth/is-auth"), {
        withCredentials: true,
      });
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
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
      const { data } = await axios.get(buildUrl("/api/user/data"), {
        withCredentials: true,
      });
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

  useEffect(() => {
    console.log("✅ Checking auth state...");
    getAuthState();
  }, []);

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
