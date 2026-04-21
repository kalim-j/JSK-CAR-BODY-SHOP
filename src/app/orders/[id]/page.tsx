"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  MapPin,
  ShoppingBag,
  User,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function OrderTracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const unsubscribe = onSnapshot(doc(db, "orders", id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Security check: only owner or admin can see
        if (data.userId === user.uid || user.email === "admin@gmail.com") {
          setOrder({ id: docSnap.id, ...data });
        } else {
          router.push("/dashboard");
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-playfair mb-4">Order Not Found</h1>
        <Link href="/dashboard" className="text-gold flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const steps = [
    { label: "Ordered", status: "pending", icon: ShoppingBag, date: order.createdAt },
    { label: "Confirmed", status: "confirmed", icon: CheckCircle2, date: order.confirmedAt },
    { label: "Shipped", status: "shipped", icon: Truck, date: order.shippedAt },
    { label: "Delivered", status: "delivered", icon: Package, date: order.deliveredAt },
  ];

  const currentStatusIndex = steps.findIndex(s => s.status === order.status.toLowerCase());
  const activeIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gold hover:underline mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Status Progress */}
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/5 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-playfair text-white mb-10 flex items-center gap-3">
                <Truck className="text-gold" /> Order Status
              </h2>

              <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/5" />
                <div 
                  className="absolute left-6 top-0 w-0.5 bg-gold transition-all duration-1000" 
                  style={{ height: `${(activeIndex / (steps.length - 1)) * 100}%` }} 
                />

                <div className="space-y-12 relative">
                  {steps.map((step, i) => {
                    const isCompleted = i <= activeIndex;
                    const isActive = i === activeIndex;

                    return (
                      <div key={i} className="flex items-start gap-6">
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted ? "bg-gold text-black shadow-lg shadow-gold/20" : "bg-white/5 text-gray-500"
                        }`}>
                          <step.icon size={20} />
                        </div>
                        <div>
                          <h4 className={`font-bold transition-all duration-500 ${isCompleted ? "text-white" : "text-gray-600"}`}>
                            {step.label}
                          </h4>
                          <p className="text-gray-500 text-xs mt-1">
                            {isActive ? "Processing your request" : isCompleted ? "Task finished" : "Pending..."}
                          </p>
                          {step.date && (
                            <p className="text-[10px] text-gold/40 mt-2 font-mono uppercase">
                              {new Date(step.date.toDate?.() || step.date).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-playfair text-white mb-6">Items in Order</h3>
              <div className="space-y-4">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                      <Image 
                        src={item.image || "/no-image.png"} 
                        alt={item.name || "Product Image"} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">{item.name}</h4>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-gray-400">Total Amount Paid</span>
                <span className="text-2xl font-bold text-white">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-gold" /> Order Info
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="text-white">{order.paymentMethod || "COD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-500 font-bold uppercase text-[10px] tracking-widest">{order.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-gold" /> Shipping Address
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {order.shippingAddress || "Krishnagiri, Tamil Nadu, India"}
              </p>
              <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-xs transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={14} /> View on Map
              </button>
            </div>

            <div className="bg-gold/10 border border-gold/20 rounded-3xl p-6">
              <h4 className="text-gold font-bold mb-2 flex items-center gap-2">
                <User size={16} /> Need help?
              </h4>
              <p className="text-white/60 text-xs mb-4">Contact our support line for any issues with your delivery.</p>
              <Link href="/contact" className="block w-full text-center py-3 bg-gold text-black font-bold rounded-xl text-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
