import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">About</span>
        </nav>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          About Aegis
        </h1>

        <div className="prose prose-lg mx-auto text-gray-700">
          <p className="mb-6">
            Aegis is an AI-driven Geospatial Education Decision Support System designed to help educational institutions, policymakers, and administrators make informed decisions about school placements, resource allocation, and educational planning.
          </p>
          
          <p className="mb-6">
            Leveraging advanced geospatial analysis and machine learning algorithms, Aegis provides insights into educational accessibility, demographic trends, and infrastructure needs to support equitable education distribution.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Key Features
          </h2>
          
          <ul className="list-disc list-inside space-y-3 mb-6">
            <li>Interactive geospatial mapping with layered data visualization</li>
            <li>AI-powered predictive analytics for school placement optimization</li>
            <li>Real-time data integration from multiple government and educational sources</li>
            <li>Customizable reporting and dashboard views for different stakeholder needs</li>
            <li>Risk assessment and hazard mapping for educational infrastructure planning</li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Technical Architecture
          </h2>
          
          <p className="mb-6">
            Built on modern web technologies including Next.js, Mapbox GL, and TensorFlow.js, Aegis provides a responsive, scalable platform that works seamlessly across devices and integrates with existing educational management systems.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Our Mission
          </h2>
          
          <p className="mb-6">
            To empower educational decision-makers with actionable geospatial insights that promote equitable access to quality education while optimizing resource utilization and infrastructure planning.
          </p>
        </div>
      </div>
    </div>
  );
}