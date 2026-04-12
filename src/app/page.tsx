"use client";

import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("@/components/home/HeroSection"), { ssr: true });
const ServicesSection = dynamic(() => import("@/components/home/ServicesSection"), { ssr: true });
const BeforeAfterSection = dynamic(() => import("@/components/home/BeforeAfterSection"), { ssr: true });
const FeaturedCars = dynamic(() => import("@/components/home/FeaturedCars"), { 
  ssr: true,
  loading: () => <div className="h-96 w-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"/></div>
});
import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MessageCircle, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BeforeAfterSection />
      <FeaturedCars />

      {/* Testimonials Strip */}
      <section className="py-20 bg-black border-y border-white/5 overflow-hidden">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              What Our <span className="gold-text">Customers Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                text: "JSK transformed my completely wrecked Creta into a brand new looking car. Couldn't be happier!",
                author: "Rajesh K.",
                city: "Krishnagiri",
                rating: 5,
              },
              {
                text: "Bought a restored Honda City from JSK. Saved ₹4 lakhs compared to market price. Excellent quality!",
                author: "Priya S.",
                city: "Chennai",
                rating: 5,
              },
              {
                text: "Professional team, transparent pricing, and on-time delivery. JSK is the best body shop in Tamil Nadu.",
                author: "Mohammed A.",
                city: "Bangalore",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: "easeInOut" }}
                className="glass-dark rounded-2xl p-6 border border-white/5 hover:border-gold-500/20 transition-colors"
                style={{ willChange: "transform, opacity" }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-gold-500 text-sm">★</span>
                  ))}
                </div>
                <p className="text-charcoal-300 text-sm leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <div className="text-white font-semibold text-sm">{t.author}</div>
                  <div className="text-charcoal-500 text-xs">{t.city}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-charcoal-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 text-gold-400 text-sm font-medium mb-8">
              Ready to Start?
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-bold text-white mb-6">
              Contact{" "}
              <span className="gold-text">JSK Motors</span>{" "}
              Today
            </h2>
            <p className="text-charcoal-400 text-lg max-w-xl mx-auto mb-10">
              Get a free estimate for your car restoration or browse our
              inventory of premium restored vehicles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn-gold px-8 py-4 rounded-full font-bold text-base flex items-center gap-2">
                Book Appointment <ChevronRight size={16} />
              </Link>
              <a
                href="https://wa.me/917010587940"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-green-500/50 text-green-400 px-8 py-4 rounded-full font-semibold hover:bg-green-500/10 transition-all duration-300"
              >
                <MessageCircle size={16} />
                WhatsApp Us
              </a>
              <a
                href="tel:7010587940"
                className="flex items-center gap-2 text-charcoal-300 hover:text-gold-400 transition-colors"
              >
                <Phone size={16} />
                7010587940
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
