import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explore Theravada Cannon. Discover Inner Peace. Realise Nonexistence.
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto italic">
            "Admonition of all Lord Buddhas is to refrain from all sins, to generate merits, and to control one's mind."
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors">
              INITIATIVES
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors">
              PROGRAMS
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-8">
              Sabbapapassa Akaranan - Kusalassa Upasampada
              <br />
              Sachiththapariyodapanan - Ethan Buddhanasasanan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* ICTB Programs */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="50" y1="10" x2="50" y2="25"/>
                    <line x1="50" y1="75" x2="50" y2="90"/>
                    <line x1="10" y1="50" x2="25" y2="50"/>
                    <line x1="75" y1="50" x2="90" y2="50"/>
                    <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                    <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                    <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                    <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                  </g>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">ICTB Programs</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our diverse range of programs is designed to support our mission of promoting peace, mindfulness, and community well-being. Here,
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-medium">
                Read More
              </button>
            </div>

            {/* Our Partners */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="50" y1="10" x2="50" y2="25"/>
                    <line x1="50" y1="75" x2="50" y2="90"/>
                    <line x1="10" y1="50" x2="25" y2="50"/>
                    <line x1="75" y1="50" x2="90" y2="50"/>
                    <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                    <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                    <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                    <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                  </g>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">Our Partners</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                At the International Centre for Theravada Buddhism (ICTB), we are proud to collaborate with esteemed organizations from around the world.
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-medium">
                Read More
              </button>
            </div>

            {/* Donations */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="50" y1="10" x2="50" y2="25"/>
                    <line x1="50" y1="75" x2="50" y2="90"/>
                    <line x1="10" y1="50" x2="25" y2="50"/>
                    <line x1="75" y1="50" x2="90" y2="50"/>
                    <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                    <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                    <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                    <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                  </g>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">Donations</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your generosity is crucial in helping the International Centre for Theravada Buddhism (ICTB) expand and develop its presence in Australia.
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-medium">
                Read More
              </button>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Upcoming Events */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="50" y1="10" x2="50" y2="25"/>
                    <line x1="50" y1="75" x2="50" y2="90"/>
                    <line x1="10" y1="50" x2="25" y2="50"/>
                    <line x1="75" y1="50" x2="90" y2="50"/>
                    <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                    <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                    <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                    <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                  </g>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">Upcoming Events</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                At the International Centre for Theravada Buddhism (ICTB), we are committed to fostering a vibrant and engaged community through a diverse range of events.
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-medium">
                Read More
              </button>
            </div>

            {/* Meditation Program */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="50" y1="10" x2="50" y2="25"/>
                    <line x1="50" y1="75" x2="50" y2="90"/>
                    <line x1="10" y1="50" x2="25" y2="50"/>
                    <line x1="75" y1="50" x2="90" y2="50"/>
                    <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                    <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                    <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                    <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                  </g>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">Meditation Program</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                At the International Centre for Theravada Buddhism (ICTB), our Meditation Program is at the heart of our mission to promote peace, mindfulness, and inner well-being.
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-medium">
                Read More
              </button>
            </div>

            {/* Special Announcements */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="50" y1="10" x2="50" y2="25"/>
                    <line x1="50" y1="75" x2="50" y2="90"/>
                    <line x1="10" y1="50" x2="25" y2="50"/>
                    <line x1="75" y1="50" x2="90" y2="50"/>
                    <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                    <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                    <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                    <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                  </g>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">Special Announcements</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We are thrilled to share a special announcement that marks a significant milestone for the International Centre for Theravada Buddhism (ICTB).
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-medium">
                Read More
              </button>
            </div>
          </div>

          {/* Buddha Quotes Section */}
          <div className="text-center py-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <div className="w-20 h-20 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                <g stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="50" y1="10" x2="50" y2="25"/>
                  <line x1="50" y1="75" x2="50" y2="90"/>
                  <line x1="10" y1="50" x2="25" y2="50"/>
                  <line x1="75" y1="50" x2="90" y2="50"/>
                  <line x1="21.5" y1="21.5" x2="32" y2="32"/>
                  <line x1="68" y1="68" x2="78.5" y2="78.5"/>
                  <line x1="78.5" y1="21.5" x2="68" y2="32"/>
                  <line x1="32" y1="68" x2="21.5" y2="78.5"/>
                </g>
                <circle cx="50" cy="50" r="8" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-8">Buddha Quotes</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic mb-4">
                Conquer anger with non-anger. Conquer badness with goodness. Conquer meanness with generosity.
              </p>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic">
                Conquer dishonesty with truth
              </p>
            </div>
            {/* Pagination dots */}
            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
