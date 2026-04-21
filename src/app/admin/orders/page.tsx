"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Search, 
  X, 
  Loader2,
  Package,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  paymentId: string;
  items: any[];
  createdAt: any;
  shippedAt?: any;
  deliveredAt?: any;
}

export default function AdminOrders() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    return unsubscribe;
  }, [isAdmin, authLoading, router]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const data: any = { status: newStatus };
      if (newStatus === "shipped") data.shippedAt = serverTimestamp();
      if (newStatus === "delivered") data.deliveredAt = serverTimestamp();
      
      await updateDoc(doc(db, "orders", orderId), data);
      toast.success(`Order set to ${newStatus}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.userName.toLowerCase().includes(search.toLowerCase()) ||
    o.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-blue-500 bg-blue-500/10';
      case 'confirmed': return 'text-purple-500 bg-purple-500/10';
      case 'shipped': return 'text-orange-500 bg-orange-500/10';
      case 'delivered': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-playfair text-white mb-2">Order <span className="text-gold">Management</span></h1>
            <p className="text-gray-400">Track and fulfill customer orders</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or User..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gold outline-none text-sm"
            />
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold/5 flex items-center justify-center text-gold">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="text-white font-mono text-[10px]">#{order.id.slice(0, 12)}...</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-medium">{order.userName}</p>
                    <p className="text-gray-500 text-xs">{order.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-white font-bold text-sm">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-[#0c0c0c] border-l border-white/10 z-[110] flex flex-col pt-20"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-playfair text-white">Order Details</h2>
                  <p className="text-gray-500 text-xs mt-1 font-mono">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Status Update */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gold uppercase tracking-widest">Update Fulfillment Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['pending', 'confirmed', 'shipped', 'delivered'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedOrder.id, s)}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          selectedOrder.status === s 
                          ? "bg-gold text-black border-gold" 
                          : "bg-white/5 text-gray-500 border-white/10 hover:border-gold/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gold uppercase tracking-widest">Ordered Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black">
                          <Image 
                            src={item.image || "/no-image.png"} 
                            alt={item.name || "Product Image"} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium">{item.name}</h4>
                          <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="bg-black/50 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Revenue</span>
                    <span className="text-white font-bold text-lg">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Payment Method</p>
                    <p className="text-white text-xs font-bold font-mono">{(selectedOrder as any).paymentMethod || "COD"}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/30">
                <button className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                  <ExternalLink size={18} /> View User Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
