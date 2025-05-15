import React, { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const EmailVerify = () => {
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext);

  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const buildUrl = (path) => {
    const cleanBase = backendUrl.replace(/\/+$/, "");
    return `${cleanBase}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index] === "") {
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    let paste = e.clipboardData.getData("text").slice(0, 6);
    paste = paste.replace(/\D/g, ""); // Remove non-digits

    const pasteArray = paste.split("");
    const newOtp = [...otp];

    pasteArray.forEach((char, i) => {
      if (inputRefs.current[i]) {
        newOtp[i] = char;
      }
    });

    setOtp(newOtp);

    const nextEmptyIndex = pasteArray.length < 6 ? pasteArray.length : 5;
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (otp.includes("") || otp.length !== 6) {
      toast.error("Please enter the full 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const otpString = otp.join("");
      const { data } = await axios.post(
        buildUrl("/api/auth/verify-account"),
        { otp: otpString },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        await getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedin && userData && userData.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedin, userData, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-200">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">Enter the OTP</p>

        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
              aria-label={`OTP Digit ${index + 1}`}
              autoFocus={index === 0}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-full cursor-pointer text-white ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-indigo-700 hover:brightness-110"
          }`}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
