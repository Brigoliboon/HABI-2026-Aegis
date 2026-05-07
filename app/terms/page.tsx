import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Terms and Conditions</span>
        </nav>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Terms and Conditions
        </h1>

        <div className="prose prose-lg mx-auto text-gray-700">
          <p className="mb-6">
            Please read these terms and conditions carefully before using Aegis: AI-Driven Geospatial Education Decision Support System.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Acceptance of Terms
          </h2>
          <p className="mb-6">
            By accessing or using Aegis, you agree to be bound by these Terms and Conditions, our Privacy Policy, and any additional terms that may apply to specific features of the Service.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Use of the Service
          </h2>
          <p className="mb-6">
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li>To transmit or procure the sending of any advertising or promotional material, including any &quot;junk mail&quot;, &quot;chain letter,&quot; or &quot;spam&quot;.</li>
            <li>To impersonate or attempt to impersonate the Service, Aegis personnel, another user, or any other person or entity.</li>
            <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Intellectual Property
          </h2>
          <p className="mb-6">
            The Service and its original content, features, and functionality are and will remain the exclusive property of Aegis and its licensors. The Service is protected by copyright, trademark, and other laws of both the Philippines and foreign countries.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            User Generated Content
          </h2>
          <p className="mb-6">
            If you upload, submit, store, send or receive any content to or through the Service, you retain whatever rights you had in that content. By submitting content, you grant us permission to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Termination
          </h2>
          <p className="mb-6">
            We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Limitation of Liability
          </h2>
          <p className="mb-6">
            In no event shall Aegis, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service;</li>
            <li>Unauthorized access, alteration, or use of the Service or any transmissions or data;</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Governing Law
          </h2>
          <p className="mb-6">
            These Terms shall be governed and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-10">
            <p className="mb-4">
              Questions about the Terms should be sent to <a href="mailto:contact@aegis.ph" className="text-blue-600 hover:underline">contact@aegis.ph</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}