import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F3A64] to-[#1E8097] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center space-x-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Privacy Policy</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/80">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none text-neutral-700">
            <p className="mb-6 leading-relaxed">
              GeoDotica is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered geospatial education intelligence platform.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">We may collect different types of information from and about users of our Service, including:</p>
            <ul className="list-disc list-inside space-y-3 mb-6 text-neutral-600">
              <li><strong className="text-[#0F3A64]">Personal Information:</strong> Name, email address, organization, and role (e.g., education planner, policymaker)</li>
              <li><strong className="text-[#0F3A64]">Usage Data:</strong> Information about how you access and use the Service, including IP address, browser type, and pages visited</li>
              <li><strong className="text-[#0F3A64]">Education Data:</strong> Datasets uploaded or accessed through the platform, including school performance, enrollment, and demographic information</li>
              <li><strong className="text-[#0F3A64]">Geospatial Data:</strong> Location-based information you provide or we collect through mapping functionality</li>
              <li><strong className="text-[#0F3A64]">Cookies:</strong> We use cookies and similar technologies to improve your experience</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">We may use the information we collect for various purposes, including:</p>
            <ul className="list-disc list-inside space-y-3 mb-6 text-neutral-600">
              <li>Providing, maintaining, and improving our education intelligence platform</li>
              <li>Managing your account and administrative functions</li>
              <li>Sending you relevant education data updates and policy insights</li>
              <li>Processing your payments and preventing fraud</li>
              <li>Analyzing usage patterns to enhance user experience and platform effectiveness</li>
              <li>Complying with legal obligations and government data protection requirements</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">Information Sharing</h2>
            <p className="mb-4">We may share your information in the following situations:</p>
            <ul className="list-disc list-inside space-y-3 mb-6 text-neutral-600">
              <li><strong className="text-[#0F3A64]">Government Partners:</strong> With your consent, we may share aggregated, anonymized insights with education agencies and research institutions</li>
              <li><strong className="text-[#0F3A64]">Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, analytics, support)</li>
              <li><strong className="text-[#0F3A64]">Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-[#0F3A64]">With Your Consent:</strong> With your explicit permission for research or partnership purposes</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">Data Security</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              We implement industry-standard security measures to protect your information against unauthorized access, alteration, or destruction. All data is encrypted in transit and at rest. We comply with Philippines data protection laws and government security requirements for sensitive data handling.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">Your Rights</h2>
            <p className="mb-4">You have certain rights regarding your personal information under applicable data protection laws:</p>
            <ul className="list-disc list-inside space-y-3 mb-6 text-neutral-600">
              <li>The right to access, update, or delete your information</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
              <li>The right to withdraw consent</li>
              <li>The right to lodge a complaint with relevant data protection authorities</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">Government Data Handling</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              When you upload government education datasets, we treat them with the highest level of security. Data is only used for the purpose of generating intelligence reports and is never shared with third parties without explicit authorization. Aggregate insights may be shared with partner agencies only in anonymized form.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">Contact Us</h2>
            <p className="mb-4 text-neutral-600">
              If you have questions about this Privacy Policy or data handling practices, please contact us:
            </p>
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 mb-8">
              <p className="text-neutral-700">
                <strong className="text-[#0F3A64]">Email:</strong>{" "}
                <a href="mailto:privacy@geodotica.ph" className="text-[#2A94A0] hover:underline">
                  privacy@geodotica.ph
                </a>
              </p>
              <p className="text-neutral-700 mt-2">
                <strong className="text-[#0F3A64]">Address:</strong> GeoDotica HQ, Metro Manila, Philippines
              </p>
              <p className="text-neutral-700 mt-2">
                <strong className="text-[#0F3A64]">For Government Agencies:</strong>{" "}
                <a href="mailto:gov@geodotica.ph" className="text-[#2A94A0] hover:underline">
                  gov@geodotica.ph
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3A64] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-neutral-300">
          <p>© 2026 GeoDotica. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
