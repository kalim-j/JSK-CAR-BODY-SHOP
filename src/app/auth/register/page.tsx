"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Chrome, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
      toast.success("Account created successfully! Welcome to JSK Motors.");
      router.push("/");
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please login.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome to JSK Motors!");
      router.push("/");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-charcoal-400 hover:text-gold-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="glass-dark rounded-3xl p-8 border border-gold-500/15 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gold-gradient shadow-gold mx-auto mb-4">
              <span className="text-black font-display font-black text-2xl">JSK</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Create Account
            </h1>
            <p className="text-charcoal-400 text-sm mt-1">
              Join JSK Motors family today
            </p>
          </div>

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 glass rounded-xl border border-white/10 hover:border-gold-500/30 text-white transition-all duration-300 mb-6 font-medium"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Chrome size={20} className="text-blue-400" />
            )}
            Sign up with Google
          </motion.button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-charcoal-500 text-xs">or register with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-charcoal-300 text-sm font-medium block mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-charcoal-300 text-sm font-medium block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-charcoal-300 text-sm font-medium block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="input-dark w-full pl-11 pr-12 py-3 rounded-xl text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-charcoal-300 text-sm font-medium block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center mt-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <p className="text-center text-charcoal-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-gold-400 hover:text-gold-300 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
