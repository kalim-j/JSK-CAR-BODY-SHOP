"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Package,
  Clock,
  Edit,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface Submission {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  quantity?: number;
  image?: string;
  images?: string[];
  description?: string;
  brand?: string;
  condition?: string;
  submittedByEmail?: string;
  submittedByName?: string;
  userId?: string;
  createdAt?: any;
  status: string;
  [key: string]: any;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  quantity?: number;
  image?: string;
  images?: string[];
  status: string;
  addedBy?: string;
  createdAt?: any;
  [key: string]: any;
}

export default function AdminProductsPage() {
  const { isAdmin } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    // Section A: pending product_submissions
    const qPending = query(
      collection(db, "product_submissions"),
      where("status", "==", "pending")
    );
    const unsubPending = onSnapshot(qPending, (snap) => {
      setPendingSubmissions(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission))
      );
    });

    // Section B: all approved products
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setApprovedProducts(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
      );
    });

    return () => {
      unsubPending();
      unsubProducts();
    };
  }, [isAdmin]);

  const handleApprove = async (sub: Submission) => {
    setActionLoading(sub.id);
    const toastId = toast.loading("Approving product...");
    try {
      await addDoc(collection(db, "products"), {
        name: sub.name || "",
        category: sub.category || "spare",
        brand: sub.brand || "",
        price: Number(sub.price || 0),
        quantity: Number(sub.quantity ?? sub.stock ?? 0),
        stock: Number(sub.quantity ?? sub.stock ?? 0),
        condition: sub.condition || "new",
        description: sub.description || "",
        images: sub.images || (sub.image ? [sub.image] : []),
        image: sub.image || (sub.images?.[0] ?? ""),
        status: "approved",
        addedBy: "admin",
        sourceUserEmail: sub.submittedByEmail || sub.userId || "",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "product_submissions", sub.id), {
        status: "approved",
      });

      toast.success("Product approved and added to marketplace!", {
        id: toastId,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve product", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this submission?")) return;
    setActionLoading(id);
    try {
      await updateDoc(doc(db, "product_submissions", id), {
        status: "rejected",
      });
      toast.success("Submission rejected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject submission");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Permanently delete this product?")) return;
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return <div className="min-h-screen bg-[#050505]" />;

  const getImage = (item: any) =>
    item.image ||
    (Array.isArray(item.images) && item.images[0]) ||
    "";

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-[#D4AF37]" size={28} />
                Marketplace{" "}
                <span className="text-[#D4AF37]">Management</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Approve user submissions and manage all marketplace products
              </p>
            </div>
          </div>
          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-yellow-500 transition-all text-sm"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        {/* ─── SECTION A: Pending Approvals ─────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <Clock size={20} className="text-[#D4AF37]" />
            <h2 className="text-xl font-bold text-white">
              User Submitted Products
            </h2>
            {pendingSubmissions.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-black text-xs font-bold">
                {pendingSubmissions.length} Pending Approval
                {pendingSubmissions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
              <CheckCircle size={40} className="text-green-500/30 mx-auto mb-3" />
              <p className="text-gray-500">No pending submissions — all caught up!</p>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-black/60 border-b border-white/5">
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted By</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {pendingSubmissions.map((sub) => (
                        <motion.tr
                          key={sub.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="w-12 h-12 bg-black rounded-lg overflow-hidden relative border border-white/10 flex-shrink-0">
                              {getImage(sub) ? (
                                <Image
                                  src={getImage(sub)}
                                  alt={sub.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={16} className="text-gray-700" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-white max-w-[180px]">
                            <div className="truncate">{sub.name || "Untitled"}</div>
                            {sub.brand && (
                              <div className="text-[10px] text-gray-500 mt-0.5">{sub.brand}</div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                              {sub.category || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#D4AF37] font-bold">
                            ₹{Number(sub.price || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-xs">
                            <div>{sub.submittedByName || sub.userId || "Anonymous"}</div>
                            {sub.submittedByEmail && (
                              <div className="text-gray-600 truncate max-w-[150px]">
                                {sub.submittedByEmail}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {actionLoading === sub.id ? (
                              <Loader2 size={16} className="animate-spin text-gray-500 ml-auto" />
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(sub)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-semibold transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(sub.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
                                  title="Reject"
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ─── SECTION B: All Approved Products ─────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">All Approved Products</h2>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
                {approvedProducts.length} Products
              </span>
            </div>
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/20 transition-all text-sm font-semibold"
            >
              <Plus size={14} />
              Add New Product
            </Link>
          </div>

          {approvedProducts.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
              <ShoppingBag size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No products yet.</p>
              <Link
                href="/admin/products/add"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-xl text-sm hover:bg-yellow-500 transition-all"
              >
                <Plus size={14} /> Add First Product
              </Link>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-black/60 border-b border-white/5">
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {approvedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="w-12 h-12 bg-black rounded-lg overflow-hidden relative border border-white/10">
                            {getImage(product) ? (
                              <Image
                                src={getImage(product)}
                                alt={product.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={16} className="text-gray-700" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate">
                          {product.name || "Untitled"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                            {product.category || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#D4AF37] font-bold">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3 text-gray-300">
                          {product.stock ?? product.quantity ?? "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              product.status === "approved"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : product.status === "inactive"
                                ? "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            {product.status || "active"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {actionLoading === product.id ? (
                            <Loader2 size={16} className="animate-spin text-gray-500 ml-auto" />
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/products/edit/${product.id}`}
                                className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-all border border-blue-500/20"
                                title="Edit"
                              >
                                <Edit size={13} />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all border border-red-500/20"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
