import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F3A64] to-[#1E8097] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center space-x-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Terms of Service</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-white/80">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none text-neutral-700">
            <p className="mb-6 leading-relaxed">
              Please read these Terms and Conditions carefully before using GeoDotica. By accessing or using our AI-powered geospatial education intelligence platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              By accessing or using GeoDotica, you agree to be bound by these Terms and Conditions, our Privacy Policy, and any additional terms that may apply to specific features of the Service. If you do not agree to these terms, please do not use the platform.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">2. Use of the Service</h2>
            <p className="mb-4 text-neutral-600">You agree to use the Service only for lawful purposes and in accordance with these Terms. As an education intelligence platform, you agree not to:</p>
            <ul className="list-disc list-inside space-y-3 mb-6 text-neutral-600">
              <li>Use the platform for unauthorized data collection or surveillance purposes</li>
              <li>Upload false, misleading, or manipulated education data that could compromise analysis integrity</li>
              <li>Attempt to bypass security measures or access restricted datasets without authorization</li>
              <li>Use insights from the platform for discriminatory education policies or practices</li>
              <li>Share account credentials with unauthorized users or government personnel without proper authorization</li>
              <li>Reverse engineer or attempt to extract the AI models or algorithms</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">3. Account and Authorization</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              Access to certain features requires user registration and verification of institutional affiliation (e.g., government agency, educational institution). You are responsible for maintaining account security and for all activities that occur under your account. Government users must comply with their respective data access policies.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">4. Data Upload and Usage</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              You retain ownership of any data you upload to GeoDotica. By uploading datasets, you grant us a non-exclusive, worldwide, royalty-free license to process and analyze such data solely for the purpose of generating intelligence reports. We will not share your raw datasets with third parties without explicit consent. Aggregated, anonymized insights may be used for platform improvement and research.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">5. Intellectual Property</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              The GeoDotica platform, including its AI models, mapping infrastructure, and user interface, is protected by intellectual property rights. You may not copy, modify, distribute, or create derivative works without explicit authorization from GeoDotica.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">6. Service Availability</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              We strive to maintain high availability of the platform, especially during critical planning periods. However, we do not guarantee uninterrupted access. Scheduled maintenance will be announced with advance notice to all registered users.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">7. Limitation of Liability</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              GeoDotica provides intelligence insights to support education planning decisions, but does not guarantee specific outcomes. We shall not be liable for decisions made based on our platform insights. Our total liability shall not exceed the fees paid by your institution for platform access.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">8. Government Use</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              Government users must comply with applicable data protection laws, including the Philippines Data Privacy Act. Classified or sensitive data should not be uploaded to the platform without proper authorization and encryption. GeoDotica is designed to handle public education data and aggregated statistics.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">9. Termination</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              We may terminate or suspend your access to the Service for violation of these terms. Upon termination, your right to use the Service will cease, and you may request deletion of your account data in accordance with our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">10. Governing Law</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Philippines. Any disputes shall be resolved in the courts of Metro Manila, unless otherwise agreed by both parties.
            </p>

            <h2 className="text-2xl font-bold text-[#0F3A64] mt-8 mb-4">11. Changes to Terms</h2>
            <p className="mb-6 text-neutral-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify registered users of significant changes via email and platform announcements at least 30 days before implementation. Continued use of GeoDotica after changes constitutes acceptance of the new Terms.
            </p>

            <div className="bg-gradient-to-r from-[#0F3A64]/5 to-[#1E8097]/5 border-l-4 border-[#2A94A0] p-6 mt-10 rounded-r-xl">
              <h3 className="text-lg font-bold text-[#0F3A64] mb-3">Contact Information</h3>
              <p className="text-neutral-600 mb-2">
                Questions about these Terms or platform usage should be directed to:
              </p>
              <p className="text-neutral-700">
                <strong>Email:</strong>{" "}
                <Link href="mailto:legal@geodotica.ph" className="text-[#2A94A0] hover:underline">
                  legal@geodotica.ph
                </Link>
              </p>
              <p className="text-neutral-700 mt-1">
                <strong>Government Partnerships:</strong>{" "}
                <Link href="mailto:gov@geodotica.ph" className="text-[#2A94A0] hover:underline">
                  gov@geodotica.ph
                </Link>
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
