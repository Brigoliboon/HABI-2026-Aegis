import Link from "next/link";

export default function LicensesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Licenses</span>
        </nav>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Software Licenses
        </h1>

        <div className="prose prose-lg mx-auto text-gray-700">
          <p className="mb-6">
            Aegis utilizes various open-source libraries and frameworks. Below are the licenses governing their use.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Core Dependencies
          </h2>
          
          <div className="space-y-6 mb-8">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Next.js
              </h3>
              <p className="mb-2 text-gray-600">
                Licensed under the MIT License.
              </p>
              <a href="https://github.com/vercel/next.js/blob/canary/LICENSE" 
                 className="text-blue-600 hover:underline text-sm"
                 target="_blank" rel="noopener noreferrer">
                View License
              </a>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Mapbox GL JS
              </h3>
              <p className="mb-2 text-gray-600">
                Licensed under the Mapbox Terms of Service.
              </p>
              <a href="https://www.mapbox.com/legal/terms/" 
                 className="text-blue-600 hover:underline text-sm"
                 target="_blank" rel="noopener noreferrer">
                View License
              </a>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                React
              </h3>
              <p className="mb-2 text-gray-600">
                Licensed under the MIT License.
              </p>
              <a href="https://github.com/facebook/react/blob/main/LICENSE" 
                 className="text-blue-600 hover:underline text-sm"
                 target="_blank" rel="noopener noreferrer">
                View License
              </a>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                TensorFlow.js
              </h3>
              <p className="mb-2 text-gray-600">
                Licensed under the Apache License 2.0.
              </p>
              <a href="https://github.com/tensorflow/tfjs/blob/master/LICENSE" 
                 className="text-blue-600 hover:underline text-sm"
                 target="_blank" rel="noopener noreferrer">
                View License
              </a>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Icon Libraries
          </h2>
          
          <div className="border rounded-lg p-6 bg-white mb-8">
            <h3 className="mb-3 text-xl font-semibold text-gray-800">
              Heroicons
            </h3>
            <p className="mb-2 text-gray-600">
              Licensed under the MIT License.
            </p>
            <a href="https://github.com/tailwindlabs/heroicons/blob/master/LICENSE" 
               className="text-blue-600 hover:underline text-sm"
               target="_blank" rel="noopener noreferrer">
              View License
            </a>
          </div>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800 mt-8">
            Development Tools
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                TypeScript
              </h3>
              <p className="mb-2 text-gray-600">
                Licensed under the Apache License 2.0.
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                ESLint
              </h3>
              <p className="mb-2 text-gray-600">
                Licensed under the MIT License.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-10">
            <p className="mb-4">
              <strong>Important:</strong> While Aegis incorporates various open-source components, 
              the overall application may be subject to additional terms and conditions. 
              Please refer to the <Link href="/terms" className="text-blue-600 hover:underline">
                Terms and Conditions
              </Link> and <Link href="/privacy" className="text-blue-600 hover:underline">
                Data Privacy Policy
              </Link> for complete legal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}