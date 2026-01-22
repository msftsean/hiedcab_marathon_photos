import Link from 'next/link';
import { Camera, Search, Download, CreditCard, Users, ImageIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/marathon-hero.jpg)' }}
        />
        {/* Dark gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Find Your Race Photos
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Search by bib number. Download high-resolution, watermark-free photos instantly.
          </p>

          {/* Search box on homepage */}
          <div className="max-w-xl mx-auto mb-8">
            <form action="/search" className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="bib"
                placeholder="Enter your bib number"
                className="flex-1 px-6 py-4 text-lg rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-all hover:scale-105 focus:ring-4 focus:ring-blue-500/50 focus:outline-none flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </form>
          </div>

          {/* Secondary action */}
          <p className="text-gray-300">
            Are you a photographer?{' '}
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 underline font-medium">
              Start selling your photos
            </Link>
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600 mt-1">Photos Available</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">200+</div>
              <div className="text-gray-600 mt-1">Events Covered</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">150+</div>
              <div className="text-gray-600 mt-1">Photographers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600 mt-1">Happy Runners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Finding and purchasing your race photos has never been easier
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Search by Bib</h3>
              <p className="text-gray-600">
                Enter your bib number and instantly find all your race photos from the event.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Checkout</h3>
              <p className="text-gray-600">
                Purchase with confidence using Stripe. No account required for checkout.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Download className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Download</h3>
              <p className="text-gray-600">
                Get high-resolution, watermark-free photos delivered instantly to your email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Photographers CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Camera className="w-12 h-12 text-white/80" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Are You a Race Photographer?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join our marketplace and start monetizing your race photography.
            Bulk upload, automatic bib detection, and easy payouts.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Users className="w-5 h-5" />
            Start Selling Photos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white mb-4">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xl font-bold">RacePhotos</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                The easiest way to find and purchase your marathon and race photos.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Runners</h4>
              <ul className="space-y-2">
                <li><Link href="/search" className="hover:text-white transition-colors">Find Photos</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Photographers</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/upload" className="hover:text-white transition-colors">Upload Photos</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RacePhotos. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
