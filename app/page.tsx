import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBarChart2 } from "react-icons/fi";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/geodotica.png"
                alt="GeoDotica"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <span className="text-xl font-bold text-[#0F3A64] block leading-tight">GeoDotica</span>
                <span className="text-[10px] text-neutral-500 tracking-wide">EDUCATION INTELLIGENCE</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <a href="#problem" className="text-neutral-700 hover:text-[#0F3A64] transition-colors font-medium text-sm">The Problem</a>
              <a href="#process" className="text-neutral-700 hover:text-[#0F3A64] transition-colors font-medium text-sm">How It Works</a>
              <a href="#data-sources" className="text-neutral-700 hover:text-[#0F3A64] transition-colors font-medium text-sm">Data Sources</a>
              <a href="#impact" className="text-neutral-700 hover:text-[#0F3A64] transition-colors font-medium text-sm">Impact</a>
              <a href="#contact" className="text-neutral-700 hover:text-[#0F3A64] transition-colors font-medium text-sm">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#contact" className="text-[#0F3A64] hover:text-[#144C82] transition-colors font-medium text-sm font-semibold">
                Get Involved
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner with Gradient Background */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3E64] via-[#144C82] via-[#1E8097] via-[#34B493] to-[#72D4AB] opacity-100"></div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        {/* Banner Image as focal point */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Problem Statement */}
            <div className="text-white">
              <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium tracking-wider mb-6">
                EDUCATION CRISIS
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Children Are Falling Through the Cracks
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-8">
                Millions can't read by age 10. The data exists to find them—but it's locked in separate silos. Education, poverty, nutrition, disaster—all disconnected.
              </p>
              <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-2xl">
                By the time planners piece together the full picture, children have already dropped out. Communities have already been pushed past the point of recovery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#process" className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0F3A64] rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg hover:shadow-xl">
                  <span>See the Solution</span>
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a href="/map" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-[#0F3A64] transition-all">
                  View the Map
                </a>
              </div>
            </div>

            {/* Right: Banner Image */}
            <div className="relative order-first lg:order-last">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <Image
                  src="/banner.png"
                  alt="GeoDotica Education Intelligence Platform"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating stat cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl border border-neutral-100">
                <div className="text-2xl font-bold text-[#0F3A64]">70%</div>
                <div className="text-xs text-neutral-500">Faster Analysis</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-neutral-100">
                <div className="text-2xl font-bold text-[#1E8097]">100+</div>
                <div className="text-xs text-neutral-500">Risk Zones</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The System Is Broken by Design */}
      <section id="problem" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F3A64] mb-4">
              The System Is Broken by Design
            </h2>
            <p className="text-neutral-600 max-w-3xl mx-auto text-lg">
              Data exists. Solutions exist. What's missing is a system that connects education risk factors into one actionable picture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { color: "from-[#0F3A64]", stat: "Siloed", desc: "Education, poverty, nutrition, and disaster data live in separate databases" },
              { color: "from-[#1E8097]", stat: "Delayed", desc: "By the time reports are compiled, the school year is already half over" },
              { color: "from-[#2A94A0]", stat: "Incomplete", desc: "Planners see only fragments—missing the compounding risks that push children out" },
              { color: "from-[#2FB290]", stat: "Invisible", desc: "The most vulnerable communities remain hidden until the crisis hits" },
            ].map((item, i) => (
              <div key={i} className="group p-6 bg-neutral-50 rounded-xl border border-neutral-200 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F3A64] mb-2">{item.stat}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Section - Visual Implementation */}
      <section id="process" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F3A64] mb-4">
              From Data to Intervention
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              A streamlined workflow that turns complex datasets into actionable education plans.
            </p>
          </div>

          {/* Visual Process Flow */}
          <div className="relative">

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2">
                  <div className="w-full aspect-video bg-gradient-to-br from-[#0F3A64] to-[#1E8097] rounded-xl shadow-lg p-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute inset-4 bg-white/10 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/60 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-black/20"></div>
                  </div>
                </div>
                 <div className="mt-[140px] lg:mt-0 lg:pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0F3A64] text-white font-bold mb-3">1</div>
                  <h3 className="text-lg font-bold text-[#0F3A64] mb-2">View Integrated Map</h3>
                  <p className="text-neutral-600 text-sm">
                    All education, poverty, nutrition, and disaster data is pre-loaded and ready to explore
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2">
                  <div className="w-full aspect-video bg-gradient-to-br from-[#1E8097] to-[#34B493] rounded-xl shadow-lg p-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute top-3 left-3 right-3 h-8 bg-white/90 rounded-lg flex items-center px-3">
                      <div className="w-4 h-4 border-2 border-[#0F3A64] rounded-full mr-2"></div>
                      <div className="h-2 flex-1 bg-neutral-200 rounded w-16"></div>
                    </div>
                    <div className="absolute inset-x-3 bottom-3 top-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#0F3A64] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#34B493] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#2A94A0] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-[140px] lg:mt-0 lg:pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1E8097] text-white font-bold mb-3">2</div>
                  <h3 className="text-lg font-bold text-[#0F3A64] mb-2">Spot Risk Zones</h3>
                  <p className="text-neutral-600 text-sm">
                    Interactive map reveals high-risk areas with layered poverty, nutrition, and disaster overlays
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2">
                  <div className="w-full aspect-video bg-gradient-to-br from-[#34B493] to-[#72D4AB] rounded-xl shadow-lg p-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute inset-4 flex items-end justify-around pb-2">
                      <div className="w-8 bg-white/80 rounded-t" style={{height: '60%'}}></div>
                      <div className="w-8 bg-white/80 rounded-t" style={{height: '80%'}}></div>
                      <div className="w-8 bg-white/80 rounded-t" style={{height: '45%'}}></div>
                      <div className="w-8 bg-white/80 rounded-t" style={{height: '90%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-[140px] lg:mt-0 lg:pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#34B493] text-white font-bold mb-3">3</div>
                  <h3 className="text-lg font-bold text-[#0F3A64] mb-2">Analyze at All Levels</h3>
                  <p className="text-neutral-600 text-sm">
                    Drill into barangay-level analytics: enrollment trends, poverty incidence, nutrition metrics, hazard exposure
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2">
                  <div className="w-full aspect-video bg-gradient-to-br from-[#2A94A0] to-[#2FB290] rounded-xl shadow-lg p-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute inset-4 grid grid-cols-2 gap-2">
                      <div className="bg-white/90 rounded p-2">
                        <div className="h-2 bg-[#0F3A64] rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-neutral-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-neutral-200 rounded w-2/3"></div>
                      </div>
                      <div className="bg-white/90 rounded p-2">
                        <div className="h-2 bg-[#34B493] rounded w-2/3 mb-2"></div>
                        <div className="h-2 bg-neutral-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-neutral-200 rounded w-3/4"></div>
                      </div>
                      <div className="bg-white/90 rounded p-2 col-span-2">
                        <div className="h-2 bg-[#2A94A0] rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-neutral-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-neutral-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-[140px] lg:mt-0 lg:pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#2A94A0] text-white font-bold mb-3">4</div>
                  <h3 className="text-lg font-bold text-[#0F3A64] mb-2">Get Recommendations</h3>
                  <p className="text-neutral-600 text-sm">
                    AI-generated intervention plans with prioritized actions, resource allocation, and expected impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section - Auto-scrolling with logos */}
      <section id="data-sources" className="py-20 px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F3A64] mb-4">
              Integrated Data Sources
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              GeoDotica connects authoritative datasets from government agencies and humanitarian organizations into one coherent intelligence system.
            </p>
          </div>

          {/* Horizontally scrollable auto-scrolling container */}
          <div className="relative">
            <div className="flex animate-scroll gap-6 pb-4 pt-4 scrollbar-hide" style={{ width: 'max-content' }}>
              {[
                { name: "Philippine Statistics Authority", abbr: "PSA", desc: "Poverty & population statistics", logo: "/logo/psa.png" },
                { name: "Department of Education", abbr: "DepEd", desc: "Enrollment & learning outcomes", logo: "/logo/deped.png" },
                { name: "PHIVOLCS", abbr: "PHIVOLCS", desc: "Geological hazard maps", logo: "/logo/phivolcs.png" },
                { name: "PAG-ASA", abbr: "PAG-ASA", desc: "Climate & weather data", logo: "/logo/pagasa.png" },
                { name: "Project NOAH", abbr: "NOAH", desc: "Flood & disaster risk", logo: "/logo/noah.png" },
                { name: "Humanitarian Data Exchange", abbr: "HDX", desc: "Humanitarian crisis data & vulnerability indices", logo: "/logo/hde.png" },
                { name: "OpenStreetMap", abbr: "OSM", desc: "Geographic infrastructure", logo: "/logo/openstreetmap.png" },
                { name: "DPWH", abbr: "DPWH", desc: "Road networks & infrastructure mapping", logo: "/logo/dpwh.png" },
                // Duplicate set for seamless loop
                { name: "Philippine Statistics Authority", abbr: "PSA", desc: "Poverty & population statistics", logo: "/logo/psa.png" },
                { name: "Department of Education", abbr: "DepEd", desc: "Enrollment & learning outcomes", logo: "/logo/deped.png" },
                { name: "PHIVOLCS", abbr: "PHIVOLCS", desc: "Geological hazard maps", logo: "/logo/phivolcs.png" },
                { name: "PAG-ASA", abbr: "PAG-ASA", desc: "Climate & weather data", logo: "/logo/pagasa.png" },
                { name: "Project NOAH", abbr: "NOAH", desc: "Flood & disaster risk", logo: "/logo/noah.png" },
                { name: "Humanitarian Data Exchange", abbr: "HDX", desc: "Humanitarian crisis data & vulnerability indices", logo: "/logo/hde.png" },
                { name: "OpenStreetMap", abbr: "OSM", desc: "Geographic infrastructure", logo: "/logo/openstreetmap.png" },
                { name: "DPWH", abbr: "DPWH", desc: "Road networks & infrastructure mapping", logo: "/logo/dpwh.png" },
              ].map((source, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-80"
                >
                  <div className="p-6 text-center">
                    {/* Logo image */}
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-white/80 p-3 shadow-sm border border-neutral-100 flex items-center justify-center">
                      <Image
                        src={source.logo}
                        alt={source.name}
                        width={64}
                        height={64}
                        className="object-contain max-h-14"
                      />
                    </div>
                    
                    <h3 className="text-base font-bold text-[#0F3A64] mb-2 leading-tight">
                      {source.name}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {source.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-neutral-500 text-sm mt-8">
            All data used in accordance with respective open data licenses and government policies.{' '}
            <Link href="/licenses" className="text-[#2A94A0] hover:text-[#0F3A64] font-medium transition-colors underline">
              See licenses
            </Link>
          </p>
        </div>
      </section>

      {/* Impact / Stats */}
      <section id="impact" className="py-24 px-6 lg:px-8 bg-[#0F3A64] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Cost of Inaction
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg">
              Every day of delayed intervention means more children falling behind. GeoDotica turns data into action before it's too late.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "70%", label: "Reduction in analysis time", sub: "From weeks to minutes" },
              { value: "100+", label: "High-risk zones pinpointed", sub: "Per province identified" },
              { value: "10x", label: "Faster policy response", sub: "From data to decision" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="text-5xl sm:text-6xl font-bold mb-3 bg-gradient-to-r from-white via-white to-[#70D2AE] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-white/70">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F3A64] mb-6">
            For Decision-Makers Who Need Answers, Not More Data
          </h2>
          <p className="text-xl text-neutral-600 mb-10 leading-relaxed">
            GeoDotica is built for DepEd, CHED, TESDA, LGUs, and education planners who understand that waiting is not an option.
            <br /><br />
            <span className="font-semibold text-[#0F3A64]">If you are responsible for education outcomes in your region, we need to talk.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/map" className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-[#0F3A64] to-[#1E8097] text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg text-lg">
              View the Map
            </a>
            <a href="mailto:gov@geodotica.ph" className="inline-flex items-center justify-center px-10 py-4 border-2 border-[#0F3A64] text-[#0F3A64] rounded-xl font-semibold hover:bg-[#0F3A64] hover:text-white transition-all text-lg">
              Schedule Briefing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3A64] text-white py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="flex items-center space-x-4">
              <Image
                src="/geodotica.png"
                alt="GeoDotica"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div>
                <h3 className="text-2xl font-bold">GeoDotica</h3>
                <p className="text-sm text-white/70">AI-Powered Geospatial Education Intelligence</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">
                © 2026 GeoDotica. All rights reserved.
              </p>
              <div className="flex justify-end space-x-6 mt-4">
                <a href="/privacy" className="text-white/70 hover:text-white text-sm">Privacy</a>
                <a href="/terms" className="text-white/70 hover:text-white text-sm">Terms</a>
                <a href="/licenses" className="text-white/70 hover:text-white text-sm">Licenses</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-sm text-white/60 max-w-2xl mx-auto">
              Built for DepEd, CHED, TESDA, LGUs, and education planners committed to leaving no child behind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
