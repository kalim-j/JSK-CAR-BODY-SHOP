"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, getDocs, doc, where, serverTimestamp } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Search, 
  Filter,
  Package,
  CheckCircle2,
  AlertCircle,
  Heart,
  HeartOff
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

export default function Shop() {
  const { user } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "wishlist"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWishlistIds(snapshot.docs.map(doc => doc.data().productId));
    });
    return unsubscribe;
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      if (wishlistIds.includes(product.id)) {
        // Remove
        const q = query(
          collection(db, "wishlist"), 
          where("userId", "==", user.uid), 
          where("productId", "==", product.id)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
        toast.success("Removed from wishlist");
      } else {
        // Add
        await addDoc(collection(db, "wishlist"), {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          createdAt: serverTimestamp()
        });
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Wishlist update failed");
    }
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Add Order to Firestore
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.displayName || "Customer",
        userEmail: user.email,
        items: cartItems,
        totalAmount,
        status: "pending",
        paymentMethod: "COD",
        createdAt: serverTimestamp(),
      });

      toast.success("Order placed successfully! We will contact you soon.");
      clearCart();
      setIsCartOpen(false);
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const categories = ["all", "spare", "accessory", "oil", "tyre"];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 md:px-8">
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-playfair text-white mb-2">Spare Parts <span className="text-gold">Marketplace</span></h1>
            <p className="text-gray-400">Genuine parts for premium automobiles</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search parts..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gold outline-none"
              />
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-gold text-black rounded-xl hover:bg-yellow-500 transition-all font-bold"
            >
              <ShoppingBag size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap capitalize ${
                category === cat 
                ? "bg-gold text-black" 
                : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-[#111] animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl text-white font-medium">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-black/50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[10px] text-gold font-bold tracking-widest uppercase mb-1">{product.category}</span>
                  <h3 className="text-white font-medium mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-white">₹{product.price.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className={`p-2 rounded-lg transition-all ${
                          wishlistIds.includes(product.id) 
                          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                          : "bg-white/5 text-gray-500 hover:text-white"
                        }`}
                      >
                        <Heart size={20} fill={wishlistIds.includes(product.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="p-2 bg-white/5 hover:bg-gold hover:text-black text-gold rounded-lg transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 px-4"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-[#0c0c0c] border-l border-white/10 z-[60] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-gold" />
                  <h2 className="text-xl font-playfair text-white">Shopping Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag size={32} className="text-gray-600" />
                    </div>
                    <h3 className="text-white text-lg font-medium">Your cart is empty</h3>
                    <p className="text-gray-500 text-sm mt-2">Add some genuine spare parts to get started</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-24 h-24 bg-[#111] rounded-xl overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.image || "/no-image.png"} 
                          alt={item.name || "Product Image"} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-white text-sm font-medium line-clamp-2">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-gold font-bold mt-1 text-sm">₹{item.price.toLocaleString()}</p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-[#111]">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
                </div>
                <button
                  disabled={cartItems.length === 0 || isCheckingOut}
                  onClick={placeOrder}
                  className="w-full bg-gold hover:bg-yellow-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                       <Loader2 className="animate-spin" size={20} /> Processing...
                    </span>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Place Order (COD)
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">Cash on Delivery Available</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
