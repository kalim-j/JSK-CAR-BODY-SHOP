"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  Send,
  Loader2,
  Package
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "spare", label: "Spare Part" },
  { value: "accessory", label: "Accessory" },
  { value: "oil", label: "Oil & Fluids" },
  { value: "tyre", label: "Tyre" },
];

export default function SubmitProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "spare",
    brand: "",
    price: "",
    quantity: "",
    condition: "New",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || "Cloudinary upload failed");
    }
    return json.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.brand || !formData.price || !formData.quantity || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Submitting your product suggestion...");

    try {
      const cloudinaryUrl = await uploadToCloudinary(imageFile);

      await addDoc(collection(db, "product_submissions"), {
        name: formData.name.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        condition: formData.condition,
        description: formData.description.trim(),
        images: [cloudinaryUrl],
        status: "pending",
        submittedBy: user.uid,
        submittedByEmail: user.email || "",
        submittedByName: user.displayName || "",
        createdAt: serverTimestamp(),
      });

      toast.success("Product submitted successfully! Admin will review it shortly.", {
        id: toastId,
        duration: 4000,
      });
      router.push("/shop");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/shop"
            className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Suggest a <span className="text-[#D4AF37]">Product</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Submit a spare part or accessory for listing in our marketplace
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 mb-8 flex items-start gap-3">
          <Package size={16} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <p className="text-gray-300 text-sm leading-relaxed">
            Your submission will be reviewed by our admin team.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Bosch Spark Plug"
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-gray-600 transition-colors"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none transition-colors"
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Brand <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g. Bosch, NGK"
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-gray-600 transition-colors"
                required
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Condition <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none transition-colors"
                required
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Price in ₹ <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0"
                  className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-gray-600 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Stock Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="e.g. 5"
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-gray-600 transition-colors"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Provide details about the product..."
              className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-gray-600 resize-none transition-colors"
              required
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Product Image <span className="text-red-400">*</span>
            </label>
            {imagePreview ? (
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 bg-[#0c0c0c]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-48 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/30 hover:bg-white/5 transition-all group bg-[#0c0c0c]"
              >
                <Upload size={28} className="text-gray-600 group-hover:text-[#D4AF37] transition-colors mb-3" />
                <p className="text-gray-400 text-sm font-medium">Click to upload image</p>
                <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={uploading}
              whileHover={{ scale: uploading ? 1 : 1.01 }}
              whileTap={{ scale: uploading ? 1 : 0.99 }}
              className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting Product...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit for Review
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
