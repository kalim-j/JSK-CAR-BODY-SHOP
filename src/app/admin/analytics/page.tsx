"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Package,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

export default function AdminAnalytics() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        // Fetch Orders
        const ordersSnap = await getDocs(collection(db, "orders"));
        let revenue = 0;
        const ordersData = ordersSnap.docs.map(doc => {
          const data = doc.data();
          revenue += data.totalAmount || 0;
          return { id: doc.id, ...data };
        });

        // Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        
        // Fetch Products
        const productsSnap = await getDocs(collection(db, "products"));

        setStats({
          totalRevenue: revenue,
          totalOrders: ordersSnap.size,
          totalUsers: usersSnap.size,
          totalProducts: productsSnap.size,
        });

        // Get 5 most recent orders
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(q);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAdmin, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Orders Completed", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Customers", value: stats.totalUsers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Inventory Items", value: stats.totalProducts, icon: Package, color: "text-gold", bg: "bg-gold/10" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-playfair text-white mb-2">Admin <span className="text-gold">Analytics</span></h1>
            <p className="text-gray-400">Manage your business performance and insights</p>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-white/5 rounded-xl px-4 py-2 text-sm text-gray-400">
            <Calendar size={16} />
            <span>Lifetime Performance</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                  <TrendingUp size={14} />+12%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-playfair text-white">Recent Transactions</h3>
              <button className="text-gold text-sm hover:underline">View All Orders</button>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Items</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{order.userName}</div>
                        <div className="text-gray-500 text-xs">{order.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 text-white font-bold">
                        ₹{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / Activity */}
          <div className="space-y-6">
            <h3 className="text-2xl font-playfair text-white">Quick Actions</h3>
            <div className="grid gap-4">
              <Link 
                href="/admin/products"
                className="w-full bg-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add New Spare Part
              </Link>
              <Link 
                href="/admin/products"
                className="w-full bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <Package size={20} /> Manage Inventory
              </Link>
              <Link 
                href="/admin/orders"
                className="w-full bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <ShoppingBag size={20} /> View All Orders
              </Link>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                <Clock size={16} className="text-gold" /> System Status
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Firebase Firestore</span>
                  <span className="text-green-500 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Order System</span>
                  <span className="text-green-500 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Cloudinary Media</span>
                  <span className="text-green-500 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
