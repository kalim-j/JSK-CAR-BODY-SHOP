"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Wrench, Paintbrush, ShieldCheck, Car, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Wrench,
    title: "Full Restoration",
    description:
      "Complete accident car restoration including structural repairs, panel replacement, and mechanical overhaul to factory standards.",
    color: "from-gold-500/20 to-gold-700/5",
    border: "border-gold-500/20",
    iconBg: "bg-gold-500/10",
  },
  {
    icon: Paintbrush,
    title: "Premium Painting",
    description:
      "Multi-layer, oven-baked paint jobs using OEM-grade materials. Dent removal, scratch repair, and full color matching.",
    color: "from-blue-500/10 to-blue-700/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description:
      "Every restored car undergoes rigorous inspection. Transparent history report, clear title transfer, and quality warranty.",
    color: "from-green-500/10 to-green-700/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/10",
  },
  {
    icon: Car,
    title: "Car Resale",
    description:
      "Buy professionally restored accident cars at 40-60% below market price. All cars are roadworthy and document-clear.",
    color: "from-purple-500/10 to-purple-700/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

export default function ServicesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding bg-charcoal-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
            What We Do
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            World-Class{" "}
            <span className="gold-text">Auto Services</span>
          </h2>
          <p className="text-charcoal-400 max-w-2xl mx-auto text-lg leading-relaxed">
            From accident-damaged to pristine condition. We specialize in restoring
            all vehicle types using the latest techniques and premium materials.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={item}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative p-6 rounded-2xl border bg-gradient-to-br ${service.color} ${service.border} group cursor-default overflow-hidden`}
              style={{ willChange: "transform, opacity" }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 group-hover:from-gold-500/5 to-transparent transition-all duration-500 rounded-2xl" />

              <div
                className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <service.icon size={24} className="text-gold-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-gold-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-charcoal-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* About section inline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-dark rounded-3xl p-8 lg:p-12 border border-gold-500/15"
          id="about"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
                About JSK Motors
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                14+ Years of Restoring{" "}
                <span className="gold-text">Excellence</span>
              </h2>
              <p className="text-charcoal-300 text-base leading-relaxed mb-6">
                JSK CAR BODY SHOP, located in Krishnagiri, Tamil Nadu, has been
                transforming accident-damaged vehicles back to their prime for over
                14 years. Our expert team uses cutting-edge equipment and premium
                materials to deliver showroom-quality results.
              </p>
              <p className="text-charcoal-400 text-sm leading-relaxed mb-8">
                We&apos;re not just a body shop — we&apos;re a comprehensive automotive
                restoration center. From minor dents to total rebuilds, we handle
                all makes and models with precision and care.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="btn-gold px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 group"
                >
                  Get a Quote
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/buy"
                  className="btn-outline-gold px-6 py-3 rounded-full text-sm font-semibold"
                >
                  Browse Inventory
                </Link>
              </div>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { num: "500+", label: "Cars Restored", sublabel: "& counting" },
                { num: "14+", label: "Years Experience", sublabel: "Est. 2010" },
                { num: "3", label: "Service Centers", sublabel: "Tamil Nadu" },
                { num: "4.9/5", label: "Customer Rating", sublabel: "Google Reviews" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-2xl p-5 text-center border border-white/5 hover:border-gold-500/20 transition-colors"
                >
                  <div className="gold-text font-display font-bold text-3xl">
                    {item.num}
                  </div>
                  <div className="text-white font-semibold text-sm mt-1">
                    {item.label}
                  </div>
                  <div className="text-charcoal-500 text-xs">{item.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
