import Link from "next/link";

export default function LicensesPage() {
  const dataSources = [
    {
      name: "Philippine Statistics Authority (PSA)",
      description: "National demographic, economic, and social data including poverty statistics, population census, and socio-economic indicators.",
      license: "Open Data (CC-BY 4.0)",
      url: "https://psa.gov.ph",
    },
    {
      name: "Humanitarian Index",
      description: "Global crisis response data including vulnerability indices, humanitarian needs overviews, and disaster impact assessments.",
      license: "Open Data (CC-BY 4.0 / ODC-By)",
      url: "https://humanitarianindex.org",
    },
    {
      name: "PHIVOLCS",
      description: "Philippine Institute of Volcanology and Seismology - geological hazard maps, earthquake data, volcanic activity reports, and disaster risk assessments.",
      license: "Government Data (Public Domain)",
      url: "https://phivolcs.dost.gov.ph",
    },
    {
      name: "DepEd",
      description: "Department of Education - school enrollment data, learning outcomes, facility inventories, and education performance metrics.",
      license: "Government Data (Public Domain / FOI)",
      url: "https://deped.gov.ph",
    },
    {
      name: "OpenStreetMap",
      description: "Community-maintained geographic data including road networks, administrative boundaries, Points of Interest (POIs), and infrastructure mapping.",
      license: "Open Database License (ODbL)",
      url: "https://openstreetmap.org",
    },
    {
      name: "PAG-ASA",
      description: "Philippine Atmospheric, Geophysical and Astronomical Services Administration - climate data, weather patterns, hydrological data, and meteorological forecasts.",
      license: "Government Data (Public Domain)",
      url: "https://pagasa.dost.gov.ph",
    },
    {
      name: "Project NOAH",
      description: "Nationwide Operational Assessment of Hazards - flood hazard maps, storm surge models, rainfall data, and disaster risk mapping.",
      license: "Open Data (CC-BY 4.0 / Government)",
      url: "https://noahcenter.up.edu.ph",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F3A64] to-[#1E8097] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center space-x-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Data Sources</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Open Data & Licenses</h1>
          <p className="text-white/80 max-w-2xl">
            GeoDotica integrates data from government agencies, humanitarian organizations, and open-source communities. We are grateful to these institutions for making their data openly available to support education planning.
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-neutral-700">
            <p className="text-lg leading-relaxed mb-12 text-neutral-600">
              Our platform combines data from multiple authoritative sources to provide a comprehensive view of education risk factors. All data is used in accordance with respective open data licenses and government policies.
            </p>

            {/* Data Sources List */}
            <div className="space-y-8">
              {dataSources.map((source, index) => (
                <div key={index} className="border-b border-neutral-200 pb-8 last:border-b-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F3A64] to-[#1E8097] flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-[#0F3A64]">{source.name}</h2>
                      </div>
                      <p className="text-neutral-600 leading-relaxed mb-3">{source.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center px-3 py-1 bg-[#0F3A64]/5 text-[#0F3A64] text-sm font-medium rounded-md border border-[#0F3A64]/10">
                          {source.license}
                        </span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-[#2A94A0] hover:text-[#0F3A64] font-medium text-sm transition-colors"
                        >
                          Visit Website
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="mt-16 p-8 bg-gradient-to-r from-[#0F3A64]/5 to-[#1E8097]/5 rounded-xl border border-[#70D2AE]/20">
              <h2 className="text-2xl font-bold text-[#0F3A64] mb-4">Open Data Commitment</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                GeoDotica operates on the principle that quality education planning should be accessible to all. By leveraging open data, we ensure that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 mb-6">
                <li>Government agencies can reproduce our analyses independently</li>
                <li>Civil society organizations can verify and build upon our findings</li>
                <li>Researchers can access aggregated insights for academic purposes</li>
                <li>Communities can understand the data that affects their schools</li>
              </ul>
              <p className="text-neutral-600 leading-relaxed">
                We comply with all data sharing requirements specified by each source, ensuring proper attribution and adherence to open data principles.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 text-[#2A94A0] hover:text-[#0F3A64] font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
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
