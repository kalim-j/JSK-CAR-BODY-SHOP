"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProductRow {
  id: string;
  sourceId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: string;
  source: "Admin" | "User Submitted";
  collectionName: "products" | "product_submissions";
  originalData: any;
}

type TabType = "all" | "approved" | "pending" | "rejected";

export default function AdminProductsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const productsSnap = await getDocs(collection(db, "products"));
      const productsList: ProductRow[] = productsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          sourceId: d.id,
          name: data.name || "Untitled",
          category: data.category || "unknown",
          price: data.price || 0,
          stock: data.stock ?? data.quantity ?? 0,
          image: data.image || (data.images && data.images[0]) || "",
          status: data.status || "approved",
          source: data.addedBy === "admin" ? "Admin" : "Admin",
          collectionName: "products",
          originalData: data,
        };
      });

      // Fetch Submissions
      const submissionsSnap = await getDocs(collection(db, "product_submissions"));
      const submissionsList: ProductRow[] = submissionsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          sourceId: d.id,
          name: data.name || "Untitled",
          category: data.category || "unknown",
          price: data.price || 0,
          stock: data.stock ?? data.quantity ?? 0,
          image: data.image || "",
          status: data.status || "pending",
          source: "User Submitted",
          collectionName: "product_submissions",
          originalData: data,
        };
      });

      // Merge and sort
      const merged = [...productsList, ...submissionsList].sort(
        (a, b) => b.status.localeCompare(a.status) // just basic sort
      );
      setItems(merged);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchItems();
    }
  }, [isAdmin]);

  const handleApprove = async (item: ProductRow) => {
    if (item.collectionName !== "product_submissions") return;
    setActionLoading(item.id);
    const toastId = toast.loading("Approving product...");
    try {
      // Create new document in products collection
      await addDoc(collection(db, "products"), {
        name: item.originalData.name || "",
        category: item.originalData.category || "spare",
        brand: item.originalData.brand || "",
        price: Number(item.originalData.price || 0),
        quantity: Number(item.stock || 0),
        stock: Number(item.stock || 0),
        condition: item.originalData.condition || "new",
        description: item.originalData.description || "",
        images: item.originalData.image ? [item.originalData.image] : [],
        image: item.originalData.image || "",
        status: "approved",
        addedBy: "admin",
        sourceUserEmail: item.originalData.submittedByEmail || "",
        createdAt: serverTimestamp(),
      });

      // Update submission status so it doesn't stay pending
      await updateDoc(doc(db, "product_submissions", item.id), {
        status: "approved_and_merged"
      });

      toast.success("Product approved and added to marketplace!", { id: toastId });
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve product", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this submission?")) return;
    setActionLoading(id);
    try {
      await updateDoc(doc(db, "product_submissions", id), {
        status: "rejected"
      });
      toast.success("Submission rejected");
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject submission");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, colName: string) => {
    if (!confirm("Are you sure you want to permanently delete this item?")) return;
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, colName, id));
      toast.success("Item deleted successfully");
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-[#050505]" />;
  }

  // Define filter logic
  const filteredItems = items.filter(item => {
    if (activeTab === "all") return item.status !== "approved_and_merged"; // hide merged ones
    if (activeTab === "approved") return item.status === "approved";
    if (activeTab === "pending") return item.status === "pending";
    if (activeTab === "rejected") return item.status === "rejected";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
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
                Marketplace <span className="text-[#D4AF37]">Products</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage all marketplace items and user submissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
              className="p-2.5 bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-yellow-500 transition-all text-sm"
            >
              <Plus size={16} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {(["all", "approved", "pending", "rejected"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/50 border-b border-white/5">
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase">Image</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase">Name</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase">Price</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase">Stock</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase">Status</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase">Source</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-400 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#D4AF37]" />
                      Loading products...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                      No products found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={`${item.collectionName}_${item.id}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-12 h-12 bg-black rounded-lg overflow-hidden relative border border-white/10">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={16} className="text-gray-700" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate">
                        {item.name}
                        <div className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-wider bg-white/5 inline-block px-1.5 py-0.5 rounded">
                          {item.category}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#D4AF37] font-bold">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {item.stock}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "approved" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          item.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {item.source}
                      </td>
                      <td className="px-5 py-3 flex items-center justify-end gap-2 h-full min-h-[72px]">
                        {actionLoading === item.id ? (
                          <div className="py-2 px-4 flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-gray-500" />
                          </div>
                        ) : (
                          <>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(item)}
                                  className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-all border border-green-500/20"
                                  title="Approve"
                                >
                                  <CheckCircle size={15} />
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all border border-red-500/20"
                                  title="Reject"
                                >
                                  <XCircle size={15} />
                                </button>
                              </>
                            )}
                            {(item.status === "approved" || item.status === "rejected") && (
                              <button
                                onClick={() => handleDelete(item.id, item.collectionName)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all"
                                title="Delete Permanently"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
