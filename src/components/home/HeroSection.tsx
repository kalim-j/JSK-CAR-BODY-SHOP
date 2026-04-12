"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Star, Shield, Zap, ArrowRight, Phone } from "lucide-react";

// ── Deterministic seeded particle data ───────────────────────────────────────
// Using Math.sin as a seeded PRNG so server and client produce identical values.
// This avoids the hydration mismatch caused by Math.random().
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  width:    seededRandom(i * 6 + 0) * 4 + 2,
  height:   seededRandom(i * 6 + 1) * 4 + 2,
  left:     seededRandom(i * 6 + 2) * 100,
  top:      seededRandom(i * 6 + 3) * 100,
  duration: 3 + seededRandom(i * 6 + 4) * 4,
  delay:    seededRandom(i * 6 + 5) * 3,
  color: i % 2 === 0 ? "#D4AF37" : "#C0C0C0",
}));

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Particles are client-only — avoids SSR / client hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { value: "500+", label: "Cars Restored" },
    { value: "14+",  label: "Years Experience" },
    { value: "4.9★", label: "Customer Rating" },
    { value: "100%", label: "Satisfaction" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)]" />
      </motion.div>

      {/* Floating Particles — rendered only on client to prevent SSR mismatch */}
      {mounted && PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none hidden md:block"
          style={{
            width:      p.width,
            height:     p.height,
            left:       `${p.left}%`,
            top:        `${p.top}%`,
            background: p.color,
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Hero Content */}
      <motion.div style={{ y: textY, opacity }} className="relative z-20 container-custom text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 glass-gold px-5 py-2 rounded-full mb-8 border border-gold-500/30"
        >
          <Star size={14} className="text-gold-500 fill-gold-500" />
          <span className="text-gold-400 text-sm font-medium tracking-wide">
            Tamil Nadu&apos;s #1 Car Restoration Service
          </span>
          <Star size={14} className="text-gold-500 fill-gold-500" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="text-white block">Transform Your</span>
          <span className="gold-text block">Dream Car</span>
          <span className="text-white font-light text-4xl sm:text-5xl lg:text-6xl block mt-2">
            Into Reality
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-charcoal-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Expert accident car restoration, premium repainting &amp; resale.
          Buy certified restored cars at{" "}
          <span className="text-gold-400 font-semibold">40–60% below market price</span>.
          Located in Krishnagiri, Tamil Nadu.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/buy" className="btn-gold px-8 py-4 rounded-full text-base font-bold flex items-center gap-2 group">
            Browse Cars
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/sell" className="btn-outline-gold px-8 py-4 rounded-full text-base font-semibold flex items-center gap-2">
            Sell Your Car
          </Link>
          <a href="tel:7010587940" className="flex items-center gap-2 text-charcoal-300 hover:text-gold-400 transition-colors group">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold-500/50 transition-colors">
              <Phone size={16} />
            </div>
            <span className="text-sm">7010587940</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-dark rounded-2xl p-4 text-center border border-white/5">
              <div className="gold-text font-display font-bold text-3xl mb-1">{stat.value}</div>
              <div className="text-charcoal-400 text-xs tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          {[
            { Icon: Shield, text: "Certified Restoration" },
            { Icon: Star,   text: "Premium Quality" },
            { Icon: Zap,    text: "Fast Turnaround" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-charcoal-300 text-sm">
              <Icon size={14} className="text-gold-500" />
              {text}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-8 h-12 rounded-full border border-gold-500/40 flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-gold-500 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
