import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RentGo Medan | Sewa Mobil & Motor Terpercaya di Sumatera Utara",
    template: "%s | RentGo Medan",
  },
  description:
    "Platform penyewaan mobil dan motor di Medan, Bandara Kualanamu, dan Stasiun Medan dengan ketersediaan real-time, harga transparan, dan rekomendasi AI.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_LANDING_URL || "https://rentgo.my.id",
  ),
  openGraph: {
    title: "RentGo Medan | Sewa Mobil & Motor Terpercaya",
    description:
      "Cek jadwal ketersediaan unit secara real-time, bebas jadwal bentrok, serah terima di Bandara Kualanamu & Stasiun Medan.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={plusJakartaSans.variable}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
