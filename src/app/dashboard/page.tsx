"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserSubmissions, CarSubmission } from "@/lib/firestore";
import { collection, query, where, getDocs, getDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, 
  Package, 
  Heart, 
  Car, 
  Settings, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  items: any[];
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<CarSubmission[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch Submissions
        const subRes = await getUserSubmissions(user.uid);
        setSubmissions(subRes);

        // Fetch Orders
        const ordersQ = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const ordersSnap = await getDocs(ordersQ);
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

        // Fetch Wishlist
        const wishlistQ = query(collection(db, "wishlist"), where("userId", "==", user.uid));
        const wishlistSnap = await getDocs(wishlistQ);
        setWishlist(wishlistSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch User Profile Data
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-playfair text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">Please login to view your dashboard</p>
        <Link href="/login" className="px-8 py-3 bg-gold text-black font-bold rounded-full hover:bg-yellow-500 transition-all">
          Login Now
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'confirmed': return 'text-blue-500 bg-blue-500/10';
      case 'shipped': return 'text-purple-500 bg-purple-500/10';
      case 'delivered': return 'text-green-500 bg-green-500/10';
      case 'paid': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <CheckCircle2 size={14} />;
      default: return <Package size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Sidebar / Profile Card */}
          <div className="w-full md:w-80 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111] border border-gold/20 rounded-2xl p-6 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={userData?.photoURL || user.photoURL || "/user-placeholder.png"}
                  alt={user.displayName || "User"}
                  fill
                  className="rounded-full object-cover border-2 border-gold/50 p-1"
                />
              </div>
              <h2 className="text-xl font-playfair text-gold mb-1">{userData?.name || user.displayName || "User"}</h2>
              <p className="text-gray-400 text-sm mb-4">{user.email}</p>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/profile/edit" 
                  className="flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm border border-white/10"
                >
                  <Settings size={16} /> Edit Profile
                </Link>
              </div>
            </motion.div>

            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                Quick Navigation
              </div>
              <nav className="flex flex-col">
                <Link href="#orders" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Package className="text-gold" size={18} />
                    <span>My Orders</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </Link>
                <Link href="#submissions" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Car className="text-gold" size={18} />
                    <span>My Car Submissions</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </Link>
                <Link href="#wishlist" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Heart className="text-gold" size={18} />
                    <span>My Wishlist</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* Orders Section */}
            <section id="orders">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-playfair text-white">Purchase History</h3>
                <Link href="/shop" className="text-gold hover:underline text-sm">Browse Shop</Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-gray-600" />
                  </div>
                  <p className="text-gray-400">No purchases yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <motion.div 
                      key={order.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                          <Package className="text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-tighter">Order ID: {order.id.slice(0, 8)}...</p>
                          <h4 className="text-white font-medium">₹{order.totalAmount.toLocaleString()}</h4>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        <Link href={`/orders/${order.id}`} className="text-gold text-sm hover:underline">Track Order</Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Wishlist Section */}
            <section id="wishlist">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-playfair text-white">My Wishlist</h3>
                <Link href="/shop" className="text-gold hover:underline text-sm">View Store</Link>
              </div>

              {wishlist.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-gray-600" />
                  </div>
                  <p className="text-gray-400">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <motion.div 
                      key={item.id}
                      className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group"
                    >
                      <div className="relative h-32 w-full">
                        <Image
                          src={item.image || "/no-image.png"}
                          alt={item.name || "Product Image"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-gold font-bold text-xs">₹{item.price.toLocaleString()}</p>
                          <Link href="/shop" className="text-gray-500 hover:text-white"><Package size={14} /></Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Submissions Section */}
            <section id="submissions">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-playfair text-white">My Car Submissions</h3>
                <Link href="/sell-car" className="px-4 py-2 bg-gold/10 text-gold text-sm rounded-lg hover:bg-gold/20 transition-colors">Sell Another Car</Link>
              </div>

              {submissions.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="text-gray-600" />
                  </div>
                  <p className="text-gray-400">No submissions found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {submissions.map((sub) => (
                    <motion.div 
                      key={sub.id}
                      className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group"
                    >
                      <div className="relative h-40 w-full">
                        <Image
                          src={sub.images[0] || "/car-placeholder.png"}
                          alt={sub.carBrand}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(sub.status)}`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-white font-playfair text-lg">{sub.carBrand} {sub.carModel}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-gray-400 text-sm">{sub.carYear} • {sub.damageLevel}</p>
                          <p className="text-gold font-bold">₹{sub.expectedPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
