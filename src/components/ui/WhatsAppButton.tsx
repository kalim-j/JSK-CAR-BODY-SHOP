"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917010587940";
const WHATSAPP_MESSAGE = "Hello JSK Motors! I'm interested in your car restoration services. Can you help me?";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="glass-dark rounded-xl px-4 py-3 mr-2 max-w-[200px] text-center shadow-xl border border-green-500/20"
          >
            <p className="text-white text-xs font-medium">Chat with us on</p>
            <p className="text-green-400 text-sm font-bold">WhatsApp</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 shadow-lg flex items-center justify-center transition-colors duration-300 group"
        style={{ boxShadow: "0 4px 20px rgba(34, 197, 94, 0.4)" }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} className="text-white" />
        {/* Pulse ring */}
        <span className="absolute w-14 h-14 rounded-full bg-green-500/40 animate-ping" />
      </motion.a>
    </div>
  );
}
