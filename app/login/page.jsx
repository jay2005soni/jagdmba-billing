"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaGithub, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 🔹 Auto-fill on page load */
  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    const savedPassword = localStorage.getItem("remember_password");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRemember(true);
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      /* 🔹 Save or remove data */
      if (remember) {
        localStorage.setItem("remember_email", email);
        localStorage.setItem("remember_password", password);
      } else {
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_password");
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Galat email ya password hai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 py-6 text-center text-white">
          <h2 className="text-xl font-semibold">Login</h2>
          <div className="flex justify-center gap-4 mt-4">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <FaFacebookF />
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <FaGithub />
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <FaGoogle />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={login} className="p-6 space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-lg bg-blue-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg bg-blue-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember Me */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600"
          >
            {loading ? "Login ho raha hai..." : "SIGN IN"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <span className="text-pink-600 font-semibold cursor-pointer">
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
