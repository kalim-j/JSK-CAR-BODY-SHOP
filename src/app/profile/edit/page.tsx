"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Camera, Save, ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: "",
    address: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            dob: data.dob || "",
            address: data.address || "",
          });
          setPreviewUrl(data.photoURL || "");
        } else {
          setFormData({
            ...formData,
            name: user.displayName || "",
          });
          setPreviewUrl(user.photoURL || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, authLoading, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let finalPhotoUrl = previewUrl;

      if (photoFile) {
        finalPhotoUrl = await uploadToCloudinary(photoFile);
      }

      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        email: user.email,
        photoURL: finalPhotoUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast.success("Profile updated successfully");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gold transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-playfair text-white">Edit Profile</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-gold/10 rounded-3xl p-8"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gold/30 p-1 bg-black">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <UserIcon size={48} className="text-white/20" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-gold text-black rounded-full cursor-pointer hover:bg-yellow-500 transition-colors shadow-xl">
                  <Camera size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>
              <p className="text-gray-500 text-xs mt-4">Cloudinary Powered Upload</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                  placeholder="+91"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Updating...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Profile Changes
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
