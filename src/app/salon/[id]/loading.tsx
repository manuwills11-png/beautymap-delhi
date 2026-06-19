export default function SalonDetailLoading() {
  return (
    <div className="min-h-dvh bg-ivory pb-20">
      {/* Hero skeleton */}
      <div className="relative h-[58vh] min-h-[26rem] w-full bg-rose-100 animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/15 to-transparent" />

        {/* Back button placeholder */}
        <div className="absolute top-20 inset-x-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="h-10 w-36 rounded-full bg-ivory/30" />
          </div>
        </div>

        {/* Title block placeholder */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10 space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-ivory/30" />
              <div className="h-6 w-28 rounded-full bg-ivory/20" />
            </div>
            <div className="h-9 w-80 rounded-lg bg-cream/20" />
            <div className="h-9 w-56 rounded-lg bg-cream/15" />
            <div className="h-8 w-44 rounded-full bg-ivory/25" />
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 grid lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <div className="space-y-3">
            <div className="h-3 w-16 bg-line/60 rounded animate-pulse" />
            <div className="h-4 w-full bg-line/40 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-line/40 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-line/40 rounded animate-pulse" />
          </div>

          {/* Gallery */}
          <div className="space-y-3">
            <div className="h-3 w-14 bg-line/60 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-line/30 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="space-y-3">
            <div className="h-3 w-16 bg-line/60 rounded animate-pulse" />
            <div className="rounded-2xl bg-line/30 animate-pulse" style={{ height: '340px' }} />
            <div className="h-3 w-64 bg-line/30 rounded animate-pulse" />
          </div>
        </div>

        {/* Right column — action panel */}
        <aside className="lg:col-span-1">
          <div className="bg-cream rounded-2xl border border-line shadow-card p-6 space-y-3">
            <div className="h-5 w-28 bg-line/60 rounded animate-pulse" />
            <div className="h-12 w-full rounded-full bg-oxblood-100 animate-pulse" />
            <div className="h-12 w-full rounded-full bg-line/30 animate-pulse" />
            <div className="h-12 w-full rounded-full bg-line/30 animate-pulse" />
          </div>
        </aside>
      </div>
    </div>
  )
}
