'use client';

import { useState, useCallback } from 'react';

interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  donated: boolean;
  section: string;
  price: number;
}

interface CartItem {
  brick: Brick;
}

export default function DonatePage() {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Define the Chaithya structure with different sections
  const chaithyaSections = [
    { name: 'spire', x: 200, y: 50, width: 200, height: 150, brickCount: 24, price: 1000 },
    { name: 'dome', x: 150, y: 200, width: 300, height: 200, brickCount: 60, price: 1000 },
    { name: 'harmika', x: 175, y: 180, width: 250, height: 40, brickCount: 20, price: 1000 },
    { name: 'drum', x: 100, y: 400, width: 400, height: 150, brickCount: 80, price: 1000 },
    { name: 'base', x: 50, y: 550, width: 500, height: 100, brickCount: 100, price: 1000 },
  ];

  // Generate bricks for each section
  const generateBricks = useCallback((section: any): Brick[] => {
    const bricks: Brick[] = [];
    const brickWidth = 20;
    const brickHeight = 12;
    const rows = Math.ceil(section.height / brickHeight);
    const cols = Math.ceil(section.width / brickWidth);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Create staggered brick pattern
        const offsetX = row % 2 === 0 ? 0 : brickWidth / 2;
        const x = section.x + col * brickWidth + offsetX;
        const y = section.y + row * brickHeight;
        
        // Only add bricks that fit within the section bounds
        if (x + brickWidth <= section.x + section.width && 
            y + brickHeight <= section.y + section.height) {
          bricks.push({
            id: `${section.name}-${row}-${col}`,
            x,
            y,
            width: brickWidth,
            height: brickHeight,
            donated: Math.random() < 0.1, // 10% already donated
            section: section.name,
            price: section.price
          });
        }
      }
    }
    return bricks;
  }, []);

  const allBricks = chaithyaSections.flatMap(generateBricks);

  const handleBrickClick = (brick: Brick) => {
    if (!brick.donated) {
      // Directly add to cart without modal
      setCart(prev => [...prev, { brick }]);
      // Mark brick as donated in the UI (optional - for visual feedback)
      brick.donated = true;
    }
  };

  const removeFromCart = (brickId: string) => {
    setCart(prev => prev.filter(item => item.brick.id !== brickId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.brick.price, 0);
  };

  const getSectionZoom = (sectionName: string) => {
    return hoveredSection === sectionName ? 'scale-110' : 'scale-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            🙏 Build the Sacred Chaithya 🙏
          </h1>
          <p className="text-lg text-amber-700 dark:text-amber-300 max-w-3xl mx-auto">
            Join us in building this sacred stupa brick by brick. Each brick represents your contribution to spreading peace, wisdom, and compassion. Hover over different sections to explore and click on individual bricks to sponsor them.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Chaithya Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden mb-8">
              <div className="relative h-[700px] mx-auto" style={{ width: '600px' }}>
                <svg
                  width="600"
                  height="700"
                  viewBox="0 0 600 700"
                  className="absolute inset-0"
                >
                  {/* Background gradient */}
                  <defs>
                    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef3c7" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                  </defs>
                  <rect width="600" height="700" fill="url(#bg)" opacity="0.1" />

                  {/* Render each section */}
                  {chaithyaSections.map((section) => (
                    <g
                      key={section.name}
                      className={`transition-transform duration-300 origin-center cursor-pointer ${getSectionZoom(section.name)}`}
                      onMouseEnter={() => setHoveredSection(section.name)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      {/* Section background */}
                      <rect
                        x={section.x}
                        y={section.y}
                        width={section.width}
                        height={section.height}
                        fill="rgba(251, 191, 36, 0.1)"
                        stroke="rgba(251, 191, 36, 0.3)"
                        strokeWidth="2"
                        rx="8"
                        className="transition-all duration-300"
                      />
                      
                      {/* Render bricks for this section */}
                      {allBricks
                        .filter(brick => brick.section === section.name)
                        .map((brick) => (
                          <rect
                            key={brick.id}
                            x={brick.x}
                            y={brick.y}
                            width={brick.width}
                            height={brick.height}
                            fill={brick.donated ? '#10b981' : '#f59e0b'}
                            stroke={brick.donated ? '#059669' : '#d97706'}
                            strokeWidth="1"
                            rx="2"
                            className={`transition-all duration-200 ${
                              brick.donated 
                                ? 'cursor-not-allowed opacity-60' 
                                : 'cursor-pointer hover:fill-amber-400 hover:stroke-amber-600'
                            }`}
                            onClick={() => handleBrickClick(brick)}
                          />
                        ))}
                      
                      {/* Section label */}
                      <text
                        x={section.x + section.width / 2}
                        y={section.y + section.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`fill-amber-800 font-semibold text-sm transition-opacity duration-300 ${
                          hoveredSection === section.name ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {section.name.toUpperCase()}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              {/* Legend */}
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-center">Legend</h3>
                <div className="flex justify-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-3 bg-amber-500 border border-amber-600 rounded-sm"></div>
                    <span className="text-gray-700 dark:text-gray-300">Available Brick</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-3 bg-green-500 border border-green-600 rounded-sm"></div>
                    <span className="text-gray-700 dark:text-gray-300">Donated Brick</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Sacred Sections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chaithyaSections.map((section) => {
                  const donatedCount = allBricks.filter(b => b.section === section.name && b.donated).length;
                  const totalCount = allBricks.filter(b => b.section === section.name).length;
                  const progress = (donatedCount / totalCount) * 100;
                  
                  return (
                    <div key={section.name} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800 dark:text-white capitalize">
                          {section.name}
                        </span>
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                          Rs.{section.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {donatedCount}/{totalCount} sponsored
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80 w-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">🛒 Your Cart</h3>
                <span className="bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                  {cart.length}
                </span>
              </div>
              
              <div className="mb-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🧱</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No bricks selected yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Click on orange bricks in the Chaithya to add them to your cart
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Summary by Section */}
                    {chaithyaSections.map((section) => {
                      const sectionBricks = cart.filter(item => item.brick.section === section.name);
                      if (sectionBricks.length === 0) return null;
                      
                      return (
                        <div key={section.name} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-800 dark:text-white capitalize">
                                {section.name} Section
                              </span>
                              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                {sectionBricks.length}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                // Remove all bricks from this section
                                const brickIds = sectionBricks.map(item => item.brick.id);
                                brickIds.forEach(id => removeFromCart(id));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                              title="Remove all bricks from this section"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {sectionBricks.length} brick{sectionBricks.length > 1 ? 's' : ''}
                            </span>
                            <span className="font-bold text-amber-600">
                              Rs.{(sectionBricks.length * section.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">Total Bricks:</span>
                      <span className="font-bold text-gray-800 dark:text-white">{cart.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-800 dark:text-white">Total Amount:</span>
                      <span className="font-bold text-2xl text-amber-600">Rs.{getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                    🙏 Complete Sacred Donation 🙏
                  </button>
                  
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      🔒 Secure Payment • Tax Deductible
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
