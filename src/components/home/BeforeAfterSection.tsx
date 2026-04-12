"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const beforeAfterItems = [
  {
    id: 1,
    title: "Hyundai Creta Front End Restoration",
    description: "Severe front collision damage restored to factory condition",
    before: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    after: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600",
    duration: "12 days",
    category: "Full Restoration",
  },
  {
    id: 2,
    title: "Maruti Swift Full Repaint",
    description: "Complete color change with premium metallic paint finish",
    before: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600",
    after: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
    duration: "5 days",
    category: "Paint Job",
  },
  {
    id: 3,
    title: "Honda City Body Repair",
    description: "Side impact damage with complete panel replacement",
    before: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600",
    after: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600",
    duration: "8 days",
    category: "Body Repair",
  },
];

export default function BeforeAfterSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const active = beforeAfterItems[activeIndex];

  return (
    <section className="section-padding bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

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
            Real Results
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Before & After{" "}
            <span className="gold-text">Transformation</span>
          </h2>
          <p className="text-charcoal-400 max-w-xl mx-auto">
            Slide to see the incredible transformations we achieve. Every car
            gets the royal treatment.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {beforeAfterItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeIndex === idx
                  ? "btn-gold"
                  : "glass text-charcoal-300 hover:text-white border border-white/10 hover:border-gold-500/30"
              }`}
            >
              {item.category}
            </button>
          ))}
        </div>

        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-3 gap-8 items-center"
        >
          {/* Comparison Slider */}
          <div className="lg:col-span-2 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={active.before}
                    alt="Before restoration"
                    style={{ objectFit: "cover" }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={active.after}
                    alt="After restoration"
                    style={{ objectFit: "cover" }}
                  />
                }
                style={{ height: "420px" }}
              />
            </div>
            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border border-red-500/30 text-red-400">
              BEFORE
            </div>
            <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border border-green-500/30 text-green-400">
              AFTER
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-dark rounded-2xl p-8 border border-gold-500/15">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/30 text-gold-400 text-xs font-medium mb-6">
              {active.category}
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              {active.title}
            </h3>
            <p className="text-charcoal-400 text-sm leading-relaxed mb-6">
              {active.description}
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-charcoal-400 text-sm">Completion Time</span>
                <span className="text-gold-400 font-semibold">{active.duration}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-charcoal-400 text-sm">Work Type</span>
                <span className="text-white font-medium">{active.category}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-charcoal-400 text-sm">Quality Grade</span>
                <span className="text-green-400 font-medium">Premium</span>
              </div>
            </div>

            <a
              href="tel:7010587940"
              className="btn-gold w-full py-3 rounded-full text-sm font-bold text-center block"
            >
              Book Same Service
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
