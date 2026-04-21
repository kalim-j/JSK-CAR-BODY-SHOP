"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Image as ImageIcon, 
  X, 
  Loader2,
  AlertCircle,
  Save
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  createdAt: any;
}

export default function AdminProducts() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "spare",
    description: "",
    stock: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });

    return unsubscribe;
  }, [isAdmin, authLoading, router]);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        stock: product.stock.toString(),
        image: product.image
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        category: "spare",
        description: "",
        stock: "",
        image: ""
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        stock: parseInt(formData.stock),
        image: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        toast.success("Product updated successfully");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success("Product added successfully");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-4xl font-playfair text-white mb-2">Manage <span className="text-gold">Inventory</span></h1>
            <p className="text-gray-400">Add or edit spare parts in the marketplace</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gold outline-none"
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-all"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-[#111] border border-white/5 rounded-3xl p-20 text-center">
            <Package size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl text-white font-medium">No products found</h3>
            <p className="text-gray-500">Start by adding your first spare part to the store</p>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{product.name}</p>
                          <p className="text-gray-500 text-[10px] line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-bold uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-mono text-sm">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${product.stock < 5 ? 'text-red-500' : 'text-gray-300'}`}>
                        {product.stock} pcs
                        {product.stock < 5 && <AlertCircle size={12} className="inline ml-1" />}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[10%] max-w-2xl mx-auto bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 z-[110] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-playfair text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Product Image</label>
                    <div className="relative h-48 w-full bg-black border-2 border-dashed border-white/10 rounded-2xl overflow-hidden group">
                      {imagePreview ? (
                        <>
                          <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer font-bold text-sm">
                              Change Image
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <ImageIcon size={32} className="text-gray-600 mb-2" />
                          <span className="text-gray-500 text-sm">Click to upload image</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!editingProduct} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Product Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                      placeholder="e.g. BMW Brake Pads"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    >
                      <option value="spare">Spare Parts</option>
                      <option value="accessory">Accessory</option>
                      <option value="oil">Oil & Fluids</option>
                      <option value="tyre">Tyres</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Stock Quantity</label>
                    <input 
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-400">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none"
                      placeholder="Product details..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={saving}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <><Loader2 className="animate-spin" size={20} /> Saving...</>
                    ) : (
                      <><Save size={20} /> {editingProduct ? "Update Product" : "Publish Product"}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
