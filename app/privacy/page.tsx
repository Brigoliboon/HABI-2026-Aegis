import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Data Privacy</span>
        </nav>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Data Privacy Policy
        </h1>

        <div className="prose prose-lg mx-auto text-gray-700">
          <p className="mb-6">
            Effective Date: April 2026
          </p>
          <p className="mb-6">
            Aegis is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-Driven Geospatial Education Decision Support System.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Information We Collect
          </h2>
          <p className="mb-6">
            We may collect different types of information from and about users of our Service, including:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li><strong>Personal Information:</strong> Name, email address, phone number, organization name, and role.</li>
            <li><strong>Usage Data:</strong> Information about how you access and use the Service, including IP address, browser type, operating system, pages visited, and time spent on those pages.</li>
            <li><strong>Geospatial Data:</strong> Location-based information you provide or that we collect through the mapping functionality.</li>
            <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Service and hold certain information.</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            How We Use Your Information
          </h2>
          <p className="mb-6">
            We may use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li>To provide, maintain, and improve our Service;</li>
            <li>To manage your account, including to perform administrative functions;</li>
            <li>To provide you with news, special offers, and general information about other goods, services, and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information;</li>
            <li>To fulfill requests you make for our products or services;</li>
            <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection;</li>
            <li>To provide you with notices about your account and/or subscription, including expiration and renewal notices, invoices, and so forth;</li>
            <li>To process your payments and to prevent fraud;</li>
            <li>For business analytics, market research, and to improve the functionality of our Service;</li>
            <li>To monitor the usage of our Service;</li>
            <li>To detect, prevent, and address technical issues;</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Sharing Your Information
          </h2>
          <p className="mb-6">
            We may share your information in the following situations:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li>With Service Providers: We may share your information with third-party vendors, service providers, contractors or agents who perform services for us or on our behalf.</li>
            <li>For Business Transfers: We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li>With Affiliates: We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</li>
            <li>With Business Partners: We may share your information with our business partners to offer you certain products, services, or promotions.</li>
            <li>With your consent: We may disclose your personal information for any other purpose with your explicit consent.</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Data Security
          </h2>
          <p className="mb-6">
            We implement appropriate technical and organizational measures to protect your information against accidental or unlawful destruction, accidental loss, unauthorized alteration, unauthorized disclosure or access, and against all other unlawful forms of processing. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Your Rights
          </h2>
          <p className="mb-6">
            Depending on your location, you may have certain rights regarding your personal information under applicable data protection laws. These rights may include:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right of rectification.</li>
            <li>The right to object.</li>
            <li>The right of restriction.</li>
            <li>The right to data portability.</li>
            <li>The right to withdraw consent.</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Children's Privacy
          </h2>
          <p className="mb-6">
            Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your Child has provided us with personal information, please contact us. If we become aware that we have collected personal information from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Changes to This Privacy Policy
          </h2>
          <p className="mb-6">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Effective Date" at the top of this Privacy Policy.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Contact Us
          </h2>
          <p className="mb-6">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <p className="mb-4">
            By email: <a href="mailto:privacy@aegis.ph" className="text-blue-600 hover:underline">privacy@aegis.ph</a>
          </p>
        </div>
      </div>
    </div>
  );
}