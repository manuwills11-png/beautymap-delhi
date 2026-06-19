import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white relative overflow-hidden px-4">
        {/* Decorative blobs */}
        <div className="absolute top-24 -left-20 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-25 pointer-events-none" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            <span>✨</span>
            Delhi&apos;s Premier Bridal Directory
          </div>

          <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Bridal Salon
            </span>
          </h1>

          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us your vision and we&apos;ll match you with the best bridal salons in Delhi —
            curated by rating, location, and style.
          </p>

          <Link
            href="/intake"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-full text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Find Your Salon
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10h12M10 4l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-20 grid grid-cols-3 gap-8 sm:gap-20 text-center">
          {[
            { value: '20+', label: 'Verified Salons' },
            { value: '4.5★', label: 'Avg Rating' },
            { value: '8', label: 'Areas Covered' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="font-playfair text-3xl font-bold text-gray-800">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
