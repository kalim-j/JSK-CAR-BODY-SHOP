"use client";

import { motion } from "framer-motion";
import { Wrench, Paintbrush, Settings, Gauge, ShieldCheck, Zap, ArrowRight, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Wrench,
    title: "Full Car Restoration",
    description: "Complete accident car restoration from frame straightening to final finishing. We restore all makes and models to factory condition.",
    price: "Starting ₹25,000",
    duration: "7-21 days",
    features: ["Frame Straightening", "Panel Replacement", "Full Repaint", "Mechanical Overhaul", "Interior Renewal"],
    color: "gold",
  },
  {
    icon: Paintbrush,
    title: "Premium Paint Job",
    description: "Multi-stage paint process with OEM-grade materials. Includes surface preparation, primer coat, base coat, and clear coat.",
    price: "Starting ₹8,000",
    duration: "3-7 days",
    features: ["Color Matching", "OEM Paint Materials", "Oven Baking", "Panel Dent Fix", "Scratch Removal"],
    color: "blue",
  },
  {
    icon: Settings,
    title: "Body Repair",
    description: "Expert body panel repair for dents, scratches, rust, and collision damage. All repaired panels are seamlessly blended.",
    price: "Starting ₹2,000",
    duration: "1-5 days",
    features: ["Dent Removal", "Rust Treatment", "Panel Alignment", "Bumper Repair", "Glass Replacement"],
    color: "green",
  },
  {
    icon: Gauge,
    title: "Mechanical Service",
    description: "Complete engine diagnostics, suspension repair, brake service, AC repair, and electrical diagnostics for all vehicles.",
    price: "Starting ₹1,500",
    duration: "Same day – 5 days",
    features: ["Engine Diagnostics", "Suspension Repair", "Brake Service", "AC Repair", "Electrical Fix"],
    color: "purple",
  },
  {
    icon: ShieldCheck,
    title: "Pre-Sale Inspection",
    description: "Comprehensive vehicle inspection report before buying or selling. 150-point check with documented history.",
    price: "₹999 per inspection",
    duration: "Same day",
    features: ["150-Point Check", "Written Report", "History Report", "Market Valuation", "RC Verification"],
    color: "orange",
  },
  {
    icon: Zap,
    title: "Quick Detailing",
    description: "Interior and exterior detailing, ceramic coating, paint protection film installation, and full-body polishing.",
    price: "Starting ₹3,500",
    duration: "1-2 days",
    features: ["Full Body Polish", "Ceramic Coating", "Interior Deep Clean", "Dashboard Restore", "Tyre Shine"],
    color: "teal",
  },
];

const colorMap: Record<string, string> = {
  gold: "text-gold-400 bg-gold-500/10 border-gold-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  green: "text-green-400 bg-green-500/10 border-green-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  teal: "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header */}
      <div className="bg-charcoal-950 border-b border-white/5 py-20">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
              Our Services
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Expert Auto <span className="gold-text">Services</span>
            </h1>
            <p className="text-charcoal-400 max-w-2xl mx-auto text-lg">
              From minor scratches to total rebuilds — we handle every automotive
              challenge with precision, speed, and guaranteed quality.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service, i) => {
            const colors = colorMap[service.color];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                id={service.title.toLowerCase().replace(/\s+/g, "-")}
                className="glass-dark rounded-2xl p-7 border border-white/5 hover:border-gold-500/20 transition-all duration-300 group flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${colors}`}
                >
                  <service.icon size={26} />
                </div>
                <h2 className="text-white font-display font-bold text-xl mb-3 group-hover:text-gold-400 transition-colors">
                  {service.title}
                </h2>
                <p className="text-charcoal-400 text-sm leading-relaxed mb-5">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-charcoal-300 text-sm">
                      <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-gold-400 font-bold text-sm">{service.price}</div>
                    <div className="text-charcoal-500 text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {service.duration}
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 transition-colors text-sm font-semibold group/link"
                  >
                    Book Now
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Process Section */}
        <div className="mt-20">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">
            Our <span className="gold-text">Process</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {[
              { num: "01", label: "Inspection", desc: "Free damage assessment and cost estimate" },
              { num: "02", label: "Approval", desc: "Get quote approved and schedule work" },
              { num: "03", label: "Restoration", desc: "Expert team works with premium materials" },
              { num: "04", label: "Delivery", desc: "Quality check & delivery on promised date" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="gold-text font-display font-black text-xl">{step.num}</span>
                </div>
                <h3 className="text-white font-bold mb-2">{step.label}</h3>
                <p className="text-charcoal-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-gold rounded-3xl p-10 text-center border border-gold-500/20"
        >
          <h3 className="font-display text-3xl font-bold text-white mb-4">
            Ready to Restore Your Car?
          </h3>
          <p className="text-charcoal-300 mb-8 max-w-md mx-auto">
            Get a free estimate today. Call us or visit our workshop in
            Krishnagiri, Tamil Nadu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn-gold px-8 py-3.5 rounded-full font-bold">
              Book Appointment
            </Link>
            <a href="tel:7010587940" className="btn-outline-gold px-8 py-3.5 rounded-full font-semibold">
              Call: 7010587940
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
