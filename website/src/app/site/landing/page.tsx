import React from "react";
import { headers } from "next/headers";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { getEnv } from "@/lib/env";
import { listCategories, listVehicles } from "@/lib/repository";
import { getCurrentSessionUser } from "@/lib/session";
import {
  addDaysIso,
  buildSurfaceUrl,
  formatRupiah,
  getTodayWib,
} from "@/lib/utils";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";

export const dynamic = "force-dynamic";

export default async function LandingSurfacePage() {
  const [vehicles, categories, user, h] = await Promise.all([
    listVehicles({ status: "active", sort: "price_asc" }),
    listCategories(),
    getCurrentSessionUser(),
    headers(),
  ]);

  const hostHeader = h.get("host");
  const bookUrl = buildSurfaceUrl("book", "/", hostHeader);
  const adminUrl = buildSurfaceUrl("admin", "/", hostHeader);
  const today = getTodayWib();
  const tomorrow = addDaysIso(today, 1);
  const env = getEnv();

  const featuredVehicles = vehicles.slice(0, 6);
  const cleanWa = env.WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  const waGeneralUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    "Halo Admin RentGo Medan, saya ingin bertanya mengenai ketersediaan sewa kendaraan.",
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: "RentGo Medan",
    description:
      "Layanan penyewaan mobil dan motor real-time di Kota Medan, Bandara Kualanamu, dan rute wisata Danau Toba.",
    url: env.NEXT_PUBLIC_LANDING_URL,
    telephone: `+${cleanWa}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Gatot Subroto No. 88",
      addressLocality: "Medan",
      addressRegion: "Sumatera Utara",
      postalCode: "20118",
      addressCountry: "ID",
    },
    areaServed: ["Medan", "Bandara Kualanamu", "Berastagi", "Danau Toba"],
    priceRange: "Rp 135.000 - Rp 1.250.000",
  };

  return (
    <div
      style={{
        backgroundColor: "var(--slate-50)",
        color: "var(--slate-900)",
      }}
      className="min-h-screen"
      data-testid="landing-surface-view"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Sticky Navbar */}
      <header
        style={{ backgroundColor: "var(--surface-white)" }}
        className="sticky top-0 z-30 border-b"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <a href="#" className="inline-flex items-center">
            <RentGoLogo surfaceLabel="Medan & Kualanamu" variant="light" />
          </a>

          <nav
            aria-label="Navigasi Halaman Utama"
            className="hidden items-center gap-5 text-sm font-semibold lg:flex"
          >
            <a
              href="#keunggulan"
              style={{ color: "var(--slate-600)" }}
              className="min-h-[44px] inline-flex items-center hover:underline"
            >
              Keunggulan Operasional
            </a>
            <a
              href="#armada"
              style={{ color: "var(--slate-600)" }}
              className="min-h-[44px] inline-flex items-center hover:underline"
            >
              Armada Unggulan
            </a>
            <a
              href="#alur"
              style={{ color: "var(--slate-600)" }}
              className="min-h-[44px] inline-flex items-center hover:underline"
            >
              Cara Menyewa
            </a>
            <a
              href="#tarif"
              style={{ color: "var(--slate-600)" }}
              className="min-h-[44px] inline-flex items-center hover:underline"
            >
              Transparansi Tarif
            </a>
            <a
              href="#faq"
              style={{ color: "var(--slate-600)" }}
              className="min-h-[44px] inline-flex items-center hover:underline"
            >
              FAQ
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={bookUrl}
              data-testid="navbar-cta-book"
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-bold sm:text-sm"
            >
              Buka Aplikasi Booking
            </a>
            <AuthControls user={user} variant="light" />
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* 2. Split-Layout Hero + Quick Date Search */}
        <section
          aria-labelledby="hero-heading"
          style={{
            backgroundColor: "var(--navy-900)",
            color: "var(--surface-white)",
          }}
          className="border-b px-4 py-12 sm:px-6 lg:py-20"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span
                  style={{
                    backgroundColor: "var(--accent-500)",
                    color: "var(--navy-900)",
                    borderRadius: "var(--radius-badge)",
                  }}
                  className="px-3 py-1 text-xs font-extrabold uppercase"
                >
                  Armada Plat BK Sumatera Utara
                </span>
                <span
                  style={{
                    backgroundColor: "rgb(255 255 255 / 0.12)",
                    borderRadius: "var(--radius-badge)",
                  }}
                  className="px-3 py-1 text-xs font-semibold"
                >
                  Bandara Kualanamu - Stasiun Medan - Danau Toba
                </span>
              </div>

              <h1
                id="hero-heading"
                className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
              >
                Sewa Mobil & Motor di Medan dengan Kepastian Jadwal Real-Time
              </h1>

              <p className="max-w-2xl text-base leading-relaxed opacity-90 sm:text-lg">
                RentGo mengintegrasikan stok armada garasi Medan, jadwal servis bengkel, dan sistem anti double-booking dalam satu platform. Pilih tanggal keberangkatan Anda, gunakan asisten AI untuk rekomendasi unit terbaik, dan kunci pesanan dalam hitungan detik.
              </p>

              {/* Quick Date Search Form redirecting to book surface */}
              <form
                action={bookUrl}
                method="GET"
                data-testid="hero-quick-search-form"
                style={{
                  backgroundColor: "var(--surface-white)",
                  color: "var(--slate-900)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-elevated)",
                }}
                className="grid gap-3 border p-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {bookUrl.includes("?site=book") ? (
                  <input type="hidden" name="site" value="book" />
                ) : null}

                <div>
                  <label
                    htmlFor="hero-start-date"
                    className="block text-xs font-bold"
                  >
                    Tanggal Mulai (WIB)
                  </label>
                  <input
                    id="hero-start-date"
                    name="start"
                    type="date"
                    defaultValue={today}
                    style={{ borderRadius: "var(--radius-control)" }}
                    className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-end-date"
                    className="block text-xs font-bold"
                  >
                    Tanggal Selesai (WIB)
                  </label>
                  <input
                    id="hero-end-date"
                    name="end"
                    type="date"
                    defaultValue={tomorrow}
                    style={{ borderRadius: "var(--radius-control)" }}
                    className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-category"
                    className="block text-xs font-bold"
                  >
                    Kategori Kendaraan
                  </label>
                  <select
                    id="hero-category"
                    name="category"
                    defaultValue="all"
                    style={{ borderRadius: "var(--radius-control)" }}
                    className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    data-testid="hero-search-submit"
                    style={{
                      backgroundColor: "var(--primary-600)",
                      color: "var(--surface-white)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="flex min-h-[44px] w-full items-center justify-center px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-95"
                  >
                    Cek Ketersediaan Unit
                  </button>
                </div>
              </form>
            </div>

            {/* LCP Hero Image following modern-web-guidance (fetchPriority="high", explicit width/height, no lazy loading) */}
            <div className="lg:col-span-5">
              <div
                style={{
                  backgroundColor: "var(--navy-800)",
                  borderColor: "rgb(255 255 255 / 0.14)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-elevated)",
                }}
                className="overflow-hidden border p-4"
              >
                <img
                  src="/vehicles/hero-fleet.svg"
                  alt="Ilustrasi Armada Kendaraan RentGo Medan Siap Jalan"
                  width={560}
                  height={380}
                  fetchPriority="high"
                  decoding="async"
                  className="h-auto w-full rounded"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Keunggulan Layanan (4 Operational Advantages) */}
        <section
          id="keunggulan"
          aria-labelledby="advantages-heading"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
        >
          <div className="max-w-2xl space-y-2">
            <span
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-700)",
                borderRadius: "var(--radius-badge)",
              }}
              className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
            >
              Standar Operasional RentGo
            </span>
            <h2
              id="advantages-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-2xl font-extrabold sm:text-3xl"
            >
              Dirancang untuk Menghindari Bentrok Jadwal dan Biaya Tersembunyi
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <div
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-600)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-base font-bold"
              >
                Proteksi Anti Double-Booking
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Setiap transaksi dikunci menggunakan validasi irisan tanggal inklusif di tingkat basis data sehingga dua pelanggan tidak pernah memesan unit yang sama pada hari yang sama.
              </p>
            </article>

            <article
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <div
                style={{
                  backgroundColor: "var(--accent-50)",
                  color: "var(--accent-600)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-base font-bold"
              >
                3 Titik Serah Terima Strategis
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Pilih lokasi pengambilan dan pengembalian unit langsung di Bandara Internasional Kualanamu, Stasiun Kereta Api Medan, atau Kantor Pusat RentGo Medan.
              </p>
            </article>

            <article
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <div
                style={{
                  backgroundColor: "var(--success-bg)",
                  color: "var(--success-text)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-base font-bold"
              >
                Sinkronisasi Jadwal Servis Bengkel
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Unit yang sedang dijadwalkan ganti oli, spooring, atau perawatan berkala otomatis disembunyikan dari katalog tanggal sewa demi keselamatan perjalanan.
              </p>
            </article>

            <article
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <div
                style={{
                  backgroundColor: "var(--info-bg)",
                  color: "var(--info-text)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-base font-bold"
              >
                Rekomendasi Armada Berbasis AI
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Bingung memilih antara MPV keluarga atau SUV tanjakan untuk ke Berastagi dan Danau Toba? Asisten AI kami mencocokkan kebutuhan Anda dengan unit yang benar-benar tersedia.
              </p>
            </article>
          </div>
        </section>

        {/* 4. Katalog Armada Unggulan (Real DB Data) */}
        <section
          id="armada"
          aria-labelledby="featured-fleet-heading"
          style={{ backgroundColor: "var(--surface-white)" }}
          className="border-y px-4 py-14 sm:px-6"
        >
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span
                  style={{
                    backgroundColor: "var(--primary-50)",
                    color: "var(--primary-700)",
                    borderRadius: "var(--radius-badge)",
                  }}
                  className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
                >
                  Data Langsung dari Database Armada
                </span>
                <h2
                  id="featured-fleet-heading"
                  style={{ color: "var(--navy-900)" }}
                  className="mt-2 text-2xl font-extrabold sm:text-3xl"
                >
                  Pilihan Armada Unggulan RentGo Medan
                </h2>
              </div>
              <a
                href={bookUrl}
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "var(--surface-white)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-bold sm:text-sm"
              >
                Lihat Seluruh {vehicles.length} Unit di Katalog Booking
              </a>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVehicles.map((v) => {
                const detailHref = buildSurfaceUrl(
                  "book",
                  `/vehicles/${v.id}?start=${today}&end=${tomorrow}`,
                  hostHeader,
                );
                return (
                  <article
                    key={v.id}
                    style={{
                      backgroundColor: "var(--slate-50)",
                      borderRadius: "var(--radius-card)",
                      boxShadow: "var(--shadow-card)",
                    }}
                    className="flex flex-col justify-between overflow-hidden border"
                  >
                    <div>
                      <div
                        style={{ backgroundColor: "var(--surface-white)" }}
                        className="relative flex h-44 items-center justify-center border-b p-4"
                      >
                        <img
                          src={v.image_url || "/vehicles/mpv.svg"}
                          alt={`${v.brand} ${v.model}`}
                          width={300}
                          height={165}
                          loading="lazy"
                          className="max-h-36 w-auto object-contain"
                        />
                        <span
                          style={{
                            backgroundColor: "var(--navy-900)",
                            color: "var(--surface-white)",
                            borderRadius: "var(--radius-badge)",
                          }}
                          className="absolute left-3 top-3 px-2.5 py-1 text-[11px] font-semibold"
                        >
                          {v.category_name}
                        </span>
                      </div>

                      <div className="space-y-3 p-5">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            style={{ color: "var(--navy-900)" }}
                            className="text-lg font-bold"
                          >
                            {v.brand} {v.model}
                          </h3>
                          <span
                            style={{ color: "var(--slate-600)" }}
                            className="font-mono text-xs font-semibold"
                          >
                            {v.plate_number}
                          </span>
                        </div>
                        <p
                          style={{ color: "var(--slate-600)" }}
                          className="line-clamp-2 text-xs"
                        >
                          {v.description}
                        </p>
                        <div
                          style={{
                            backgroundColor: "var(--surface-white)",
                            color: "var(--slate-600)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="grid grid-cols-3 gap-2 border p-2.5 text-center text-xs font-semibold"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                            {v.transmission === "automatic"
                              ? "Matic"
                              : "Manual"}
                          </span>
                          <span className="flex items-center justify-center gap-1">
                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                            {v.seats} Kursi
                          </span>
                          <span className="flex items-center justify-center gap-1 capitalize">
                            <Fuel className="h-3.5 w-3.5" aria-hidden="true" />
                            {v.fuel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t px-5 py-4">
                      <div className="tabular-nums">
                        <p
                          style={{ color: "var(--navy-900)" }}
                          className="text-lg font-extrabold"
                        >
                          {formatRupiah(v.daily_price)}
                          <span
                            style={{ color: "var(--slate-600)" }}
                            className="text-xs font-normal"
                          >
                            {" "}
                            / hari
                          </span>
                        </p>
                      </div>
                      <a
                        href={detailHref}
                        style={{
                          backgroundColor: "var(--primary-600)",
                          color: "var(--surface-white)",
                          borderRadius: "var(--radius-control)",
                        }}
                        className="inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-bold"
                      >
                        Pesan Unit
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Cara Menyewa (3 Steps) */}
        <section
          id="alur"
          aria-labelledby="how-it-works-heading"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
        >
          <div className="max-w-2xl space-y-2">
            <span
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-700)",
                borderRadius: "var(--radius-badge)",
              }}
              className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
            >
              Prosedur Cepat & Terstruktur
            </span>
            <h2
              id="how-it-works-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-2xl font-extrabold sm:text-3xl"
            >
              3 Langkah Menyewa Kendaraan di RentGo
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <span
                style={{
                  backgroundColor: "var(--navy-900)",
                  color: "var(--accent-500)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block px-3 py-1 text-xs font-extrabold"
              >
                Langkah 01
              </span>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                Pilih Tanggal & Unit Armada
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Masukkan tanggal mulai dan tanggal selesai sewa (WIB) di <code>book.rentgo.my.id</code>. Gunakan filter spesifikasi atau fitur &ldquo;Bantu Saya Pilih&rdquo; berbasis AI untuk menemukan kendaraan yang tersedia.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <span
                style={{
                  backgroundColor: "var(--navy-900)",
                  color: "var(--accent-500)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block px-3 py-1 text-xs font-extrabold"
              >
                Langkah 02
              </span>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                Masuk Google & Lengkapi SIM
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Masuk menggunakan akun Google Anda, lengkapi nomor WhatsApp dan nomor SIM A/C satu kali saja, lalu pilih titik pengambilan di Bandara Kualanamu, Stasiun Medan, atau Kantor RentGo.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="space-y-3 border p-6"
            >
              <span
                style={{
                  backgroundColor: "var(--navy-900)",
                  color: "var(--accent-500)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block px-3 py-1 text-xs font-extrabold"
              >
                Langkah 03
              </span>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                Unggah Bukti Bayar & Terima Kunci
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs leading-relaxed">
                Lakukan pembayaran via transfer bank/QRIS dalam batas waktu 24 jam, unggah bukti bayar di halaman detail pesanan, dan konfirmasi instan melalui tombol WhatsApp Admin.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Transparansi Harga & Ketentuan Sewa */}
        <section
          id="tarif"
          aria-labelledby="pricing-transparency-heading"
          style={{ backgroundColor: "var(--surface-white)" }}
          className="border-y px-4 py-14 sm:px-6"
        >
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="max-w-2xl space-y-2">
              <span
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
              >
                Kalkulasi Harga Server-Side
              </span>
              <h2
                id="pricing-transparency-heading"
                style={{ color: "var(--navy-900)" }}
                className="text-2xl font-extrabold sm:text-3xl"
              >
                Transparansi Tarif Harian & Ketentuan Penyewaan
              </h2>
              <p style={{ color: "var(--slate-600)" }} className="text-sm">
                Rumus perhitungan durasi sewa bersifat inklusif: <code>total_days = (end_date - start_date) + 1 hari</code>. Tidak ada mark-up tersembunyi saat checkout.
              </p>
            </div>

            <div
              className="overflow-x-auto border"
              style={{ borderRadius: "var(--radius-card)" }}
              role="region"
              aria-labelledby="pricing-transparency-heading"
              tabIndex={0}
            >
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--slate-100)",
                      color: "var(--slate-600)",
                    }}
                    className="border-b text-xs uppercase"
                  >
                    <th
                      style={{ backgroundColor: "var(--slate-100)" }}
                      className="sticky left-0 z-10 px-4 py-3 font-semibold"
                    >
                      Kategori Kendaraan
                    </th>
                    <th className="px-4 py-3 font-semibold">Contoh Unit Armada</th>
                    <th className="px-4 py-3 font-semibold">Kapasitas</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Rentang Tarif Harian
                    </th>
                    <th className="px-4 py-3 font-semibold">Rekomendasi Rute</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-bold"
                    >
                      Motor Matik
                    </th>
                    <td className="px-4 py-3">Honda Vario 160, Yamaha NMAX 155</td>
                    <td className="px-4 py-3 tabular-nums">2 Penumpang</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                      Rp 135.000 - Rp 160.000
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Komuter harian dalam Kota Medan & kampus USU/WBI
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-bold"
                    >
                      Mobil City
                    </th>
                    <td className="px-4 py-3">Honda Brio RS, Toyota Agya GR</td>
                    <td className="px-4 py-3 tabular-nums">5 Penumpang</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                      Rp 320.000 - Rp 350.000
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Mobilitas bisnis pusat Kota Medan & antar-jemput Kualanamu
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-bold"
                    >
                      MPV / Minibus
                    </th>
                    <td className="px-4 py-3">
                      Toyota Avanza G, Mitsubishi Xpander, Innova Reborn
                    </td>
                    <td className="px-4 py-3 tabular-nums">7 Penumpang</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                      Rp 420.000 - Rp 650.000
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Perjalanan keluarga ke Parapat, Danau Toba, dan Berastagi
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-bold"
                    >
                      SUV Tangguh
                    </th>
                    <td className="px-4 py-3">
                      Toyota Rush GR, Toyota Fortuner VRZ
                    </td>
                    <td className="px-4 py-3 tabular-nums">7 Penumpang</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                      Rp 520.000 - Rp 950.000
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Medan tanjakan ekstrem Tele, Samosir, dan kunjungan proyek
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-bold"
                    >
                      Van / Hiace
                    </th>
                    <td className="px-4 py-3">Toyota Hiace Commuter</td>
                    <td className="px-4 py-3 tabular-nums">14 Penumpang</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                      Rp 1.250.000
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Rombongan wisata dan perjalanan dinas instansi
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 7. FAQ (Frequently Asked Questions) */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
        >
          <div className="max-w-2xl space-y-2">
            <span
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-700)",
                borderRadius: "var(--radius-badge)",
              }}
              className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
            >
              Pertanyaan Umum Penyewa
            </span>
            <h2
              id="faq-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-2xl font-extrabold sm:text-3xl"
            >
              Informasi Penting Sebelum Menyewa di RentGo Medan
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Bagaimana cara perhitungan jumlah hari sewa di RentGo?",
                a: "RentGo menggunakan perhitungan tanggal inklusif sesuai zona waktu WIB (Asia/Jakarta). Jika Anda menyewa mulai tanggal 10 hingga 10 pada hari yang sama, dihitung 1 hari penuh. Jika menyewa tanggal 10 hingga 12, dihitung 3 hari sewa.",
              },
              {
                q: "Apakah unit bisa dijemput langsung di Bandara Kualanamu?",
                a: "Bisa. Saat mengisi formulir checkout, pilih lokasi pengambilan Bandara Kualanamu, Stasiun Medan, atau Kantor RentGo Medan sesuai jadwal kedatangan Anda.",
              },
              {
                q: "Apa syarat dokumen untuk menyewa mobil atau motor?",
                a: "Anda cukup masuk dengan akun Google terverifikasi dan melengkapi Nomor HP/WhatsApp aktif serta Nomor SIM A (untuk mobil) atau SIM C (untuk motor) pada profil atau formulir checkout.",
              },
              {
                q: "Berapa lama batas waktu pembayaran setelah pesanan dibuat?",
                a: "Setiap pesanan berstatus Pending memiliki batas waktu pembayaran 24 jam. Sistem housekeeping harian akan mengubah pesanan yang melewati batas waktu menjadi Expired agar unit kembali tersedia bagi pelanggan lain.",
              },
              {
                q: "Apakah saya bisa membatalkan pesanan jika jadwal berubah?",
                a: "Selama pesanan Anda masih berstatus Menunggu (Pending), Anda dapat menekan tombol Batalkan Pesanan langsung dari halaman Pesanan Saya tanpa biaya penalti.",
              },
              {
                q: "Bagaimana cara kerja fitur Bantu Saya Pilih berbasis AI?",
                a: "Fitur asisten AI kami menganalisis kebutuhan bahasa alami Anda (jumlah kursi, transmisi, rute, dan budget) lalu hanya memilih dari daftar kendaraan yang nyata dan berstatus tersedia pada tanggal pilihan Anda.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "var(--surface-white)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
                className="space-y-2 border p-5"
              >
                <h3
                  style={{ color: "var(--navy-900)" }}
                  className="text-sm font-bold"
                >
                  {item.q}
                </h3>
                <p
                  style={{ color: "var(--slate-600)" }}
                  className="text-xs leading-relaxed"
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Final CTA + WhatsApp Contact */}
        <section
          aria-labelledby="final-cta-heading"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"
        >
          <div
            style={{
              backgroundColor: "var(--navy-900)",
              color: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-elevated)",
            }}
            className="flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center"
          >
            <div className="max-w-2xl space-y-2">
              <h2
                id="final-cta-heading"
                className="text-2xl font-extrabold sm:text-3xl"
              >
                Siap Memulai Perjalanan Anda di Medan & Sumatera Utara?
              </h2>
              <p className="text-sm opacity-90">
                Cek ketersediaan unit secara real-time di aplikasi booking kami atau hubungi tim operasional RentGo Medan melalui WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={bookUrl}
                style={{
                  backgroundColor: "var(--accent-500)",
                  color: "var(--navy-900)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[48px] items-center gap-2 px-5 py-3 text-sm font-extrabold"
              >
                <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                <span>Mulai Sewa Sekarang</span>
              </a>
              <a
                href={waGeneralUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "var(--success)",
                  color: "var(--surface-white)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[48px] items-center gap-2 px-5 py-3 text-sm font-bold"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Hubungi WhatsApp Admin</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer
        style={{
          backgroundColor: "var(--surface-white)",
          color: "var(--slate-600)",
        }}
        className="border-t px-4 py-10 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <RentGoLogo surfaceLabel="Medan" variant="light" />
            <p className="text-xs leading-relaxed">
              Sistem Manajemen Penyewaan Kendaraan Berbasis Web dengan Arsitektur Multi-Subdomain dan Metodologi SDLC Incremental.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <p
              style={{ color: "var(--navy-900)" }}
              className="font-bold uppercase"
            >
              Ekosistem Subdomain
            </p>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="hover:underline">
                  rentgo.my.id (Landing & Profil Layanan)
                </a>
              </li>
              <li>
                <a href={bookUrl} className="hover:underline">
                  book.rentgo.my.id (Katalog, AI, & Checkout)
                </a>
              </li>
              <li>
                <a href={adminUrl} className="hover:underline">
                  admin.rentgo.my.id (Dasbor Operasional Admin)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <p
              style={{ color: "var(--navy-900)" }}
              className="font-bold uppercase"
            >
              Titik Layanan Medan
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Bandara Internasional Kualanamu (KNO)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Stasiun Kereta Api Medan (City Railway)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Kantor Pusat RentGo Jl. Gatot Subroto Medan</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <p
              style={{ color: "var(--navy-900)" }}
              className="font-bold uppercase"
            >
              Identitas Akademik UTS
            </p>
            <p>Mahasiswa: Akbar Riansyah</p>
            <p>Proyek Individu No. 2: Sistem Manajemen Penyewaan Kendaraan</p>
            <p>
              Program Studi Teknologi Rekayasa Perangkat Lunak (TRPL) - Politeknik Wilmar Bisnis Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
