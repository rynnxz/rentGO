export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="space-y-4">
        <p style={{ color: "var(--slate-600)" }} className="text-sm font-medium">
          Memuat data ketersediaan armada RentGo Medan...
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
              }}
              className="h-64 animate-pulse border p-5"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
