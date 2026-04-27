import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JSK CAR BODY SHOP | Premium Car Restoration & Resale in Tamil Nadu",
  description:
    "JSK CAR BODY SHOP - Expert accident car restoration, premium repainting & resale in Krishnagiri, Tamil Nadu.",
  keywords:
    "car restoration, accident car repair, car resale, JSK CAR BODY SHOP, Krishnagiri, Tamil Nadu, car painting, body shop India",
  openGraph: {
    title: "JSK CAR BODY SHOP | Premium Car Restoration & Resale",
    description:
      "JSK CAR BODY SHOP - Expert accident car restoration, premium repainting & resale in Krishnagiri, Tamil Nadu.",
    type: "website",
    locale: "en_IN",
  },
  verification: {
    google: "3FzK2uEANXU1UxcCAAfgeX8axs3N4oSq-2slO34BnCU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-black text-white antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#1a1a1a",
                  color: "#ffffff",
                  border: "1px solid #D4AF37",
                },
                success: {
                  iconTheme: {
                    primary: "#D4AF37",
                    secondary: "#000",
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
