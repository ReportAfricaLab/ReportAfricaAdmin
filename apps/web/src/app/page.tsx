import { COLORS } from '@reportafrica/shared';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image src="/logo.png" alt="ReportAfrica" width={180} height={48} className="h-12 w-auto" priority />
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#features">Features</a>
            <a href="#categories">Categories</a>
            <a href="#download">Download</a>
          </nav>
          <div className="flex gap-3">
            <a href="/login" className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5">
              Log In
            </a>
            <a href="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-6">
            Africa&apos;s Real-Time Citizen Reporting Network
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            See It. Report It.<br />
            <span className="text-primary">Change It.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Empower your community with real-time reporting. Report traffic, emergencies, corruption, and more — instantly from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="px-8 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition">
              Start Reporting
            </a>
            <a href="#features" className="px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Platform Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Live Reporting', desc: 'Go live instantly from any incident scene. Broadcast events in real time.', color: 'text-emergency' },
              { title: 'Geo-Based Map', desc: 'Interactive incident map showing live events, traffic, and emergencies near you.', color: 'text-info' },
              { title: 'AI Verification', desc: 'AI-powered content verification to combat fake news and misinformation.', color: 'text-primary' },
              { title: 'Emergency SOS', desc: 'One-tap emergency reporting with automatic location sharing and alerts.', color: 'text-emergency' },
              { title: 'Community Support', desc: 'Help fellow citizens through verified humanitarian fundraising campaigns.', color: 'text-humanitarian' },
              { title: 'Anonymous Reports', desc: 'Report safely with identity protection, face blur, and voice masking.', color: 'text-secondary' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition">
                <h4 className={`text-lg font-semibold mb-2 ${feature.color}`}>{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Report Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Traffic', 'Police & Security', 'Government', 'Construction', 'Elections', 'Emergency', 'Environmental', 'Market & Consumer'].map((cat) => (
              <div key={cat} className="p-4 bg-white rounded-xl border border-gray-100 text-center hover:border-primary transition cursor-pointer">
                <span className="text-sm font-medium text-gray-700">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Image src="/logo.png" alt="ReportAfrica" width={160} height={40} className="h-10 w-auto" />
          <p className="text-sm">&copy; 2024 ReportAfrica. Africa&apos;s Citizen-Powered Reporting Platform.</p>
        </div>
      </footer>
    </main>
  );
}
