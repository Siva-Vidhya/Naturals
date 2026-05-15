"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "AI Demo", href: "#demo" },
    { name: "Dashboard", href: "#dashboard" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "flex items-center justify-between w-full max-w-7xl px-6 py-3 transition-all duration-500 rounded-full",
          isScrolled ? "glass shadow-lg" : "bg-transparent"
        )}
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blush to-lavender shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">NeuroStrom</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-lavender text-foreground/80"
            >
              {link.name}
            </a>
          ))}
          {user ? (
            <button 
              onClick={handleLogout}
              className="px-6 py-2 text-sm font-semibold text-foreground transition-all rounded-full bg-white/40 hover:bg-white/60 shadow-md border border-white/40"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/auth/login"
              className="px-6 py-2 text-sm font-semibold text-white transition-transform rounded-full bg-gradient-to-r from-blush to-lavender hover:scale-105 active:scale-95 shadow-lg shadow-blush/20"
            >
              Log In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-4 right-4 p-6 glass rounded-3xl md:hidden flex flex-col gap-4 shadow-2xl"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-foreground/80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {user ? (
            <button 
              onClick={handleLogout}
              className="w-full py-3 text-lg font-semibold text-foreground rounded-2xl bg-white/40 border border-white/40"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/auth/login"
              className="w-full py-3 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-blush to-lavender text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Log In
            </Link>
          )}
        </motion.div>
      )}
    </header>
  );
}
