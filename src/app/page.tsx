'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { stripePromise } from '@/lib/stripe';

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [zoomLens, setZoomLens] = useState<{
    visible: boolean;
    x: number;
    y: number;
    centerX: number;
    centerY: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    centerX: 0,
    centerY: 0,
  });
  const svgRef = useRef<SVGSVGElement>(null);

  // Define the Chaithya structure with four stacked parts
  const chaithyaSections = [
    { name: 'triangle-top', x: 260, y: 50, width: 80, height: 80, brickCount: 15, price: 1000 },
    { name: 'dome', x: 100, y: -60, width: 400, height: 400, brickCount: 60, price: 1000 },
    { name: 'upper-rectangle', x: 75, y: 340, width: 450, height: 50, brickCount: 30, price: 1000 },
    { name: 'base-rectangle', x: 50, y: 390, width: 500, height: 50, brickCount: 60, price: 1000 },
  ];

  // Generate bricks for each section
  const generateBricks = useCallback((section: { name: string; x: number; y: number; width: number; height: number; brickCount: number; price: number }): Brick[] => {
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
        
        let shouldIncludeBrick = false;
        
        // Different shape logic for each section
        if (section.name === 'triangle-top') {
          // Triangle shape: narrower at top, wider at bottom
          const triangleY = y - section.y;
          const triangleProgress = triangleY / section.height; // 0 at top, 1 at bottom
          const triangleWidthAtY = section.width * triangleProgress;
          const triangleStartX = section.x + (section.width - triangleWidthAtY) / 2;
          const triangleEndX = triangleStartX + triangleWidthAtY;
          
          shouldIncludeBrick = x >= triangleStartX && x + brickWidth <= triangleEndX;
        } else if (section.name === 'dome') {
          // Half-circle dome shape
          const centerX = section.x + section.width / 2;
          const centerY = section.y + section.height; // Bottom of the dome
          const radius = section.width / 2;
          const brickCenterX = x + brickWidth / 2;
          const brickCenterY = y + brickHeight / 2;
          
          // Check if brick center is within the dome (above the diameter line)
          const distanceFromCenter = Math.sqrt(
            Math.pow(brickCenterX - centerX, 2) + Math.pow(brickCenterY - centerY, 2)
          );
          shouldIncludeBrick = distanceFromCenter <= radius && brickCenterY <= centerY;
        } else {
          // Rectangle shapes (upper-rectangle and base-rectangle)
          shouldIncludeBrick = x + brickWidth <= section.x + section.width && 
                              y + brickHeight <= section.y + section.height;
        }
        
        if (shouldIncludeBrick) {
          // Use deterministic pattern based on brick position to avoid hydration mismatch
          const brickHash = (row * 7 + col * 11 + section.name.length) % 100;
          bricks.push({
            id: `${section.name}-${row}-${col}`,
            x,
            y,
            width: brickWidth,
            height: brickHeight,
            donated: brickHash < 10, // 10% already donated (deterministic)
            section: section.name,
            price: section.price
          });
        }
      }
    }
    return bricks;
  }, []);

  const allBricks = chaithyaSections.flatMap(generateBricks);

  // Memoize calculations to prevent hydration mismatches
  const sponsoredCount = useMemo(() => 
    allBricks.filter(brick => brick.donated).length, 
    [allBricks]
  );
  
  const availableCount = useMemo(() => 
    134500 - sponsoredCount, 
    [sponsoredCount]
  );
  
  const progressPercentage = useMemo(() => 
    (sponsoredCount / 134500) * 100, 
    [sponsoredCount]
  );

  const handleBrickClick = (brick: Brick) => {
    if (!brick.donated) {
      // Check if brick is already in cart
      const isInCart = cart.some(item => item.brick.id === brick.id);
      
      if (isInCart) {
        // Remove from cart if already there
        setCart(prev => prev.filter(item => item.brick.id !== brick.id));
      } else {
        // Add to cart
        setCart(prev => [...prev, { brick }]);
      }
    }
  };

  const removeFromCart = (brickId: string) => {
    setCart(prev => prev.filter(item => item.brick.id !== brickId));
  };

  const isBrickInCart = (brickId: string) => {
    return cart.some(item => item.brick.id === brickId);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.brick.price, 0);
  };

  const getSectionZoom = (sectionName: string) => {
    return hoveredSection === sectionName ? 'scale-110' : 'scale-100';
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = 600 / svgRect.width;
    const scaleY = 700 / svgRect.height;
    
    const mouseX = (e.clientX - svgRect.left) * scaleX;
    const mouseY = (e.clientY - svgRect.top) * scaleY;
    
    // Only show zoom lens when hovering over the Chaithya structure
    const isOverChaithya = chaithyaSections.some(section => {
      if (section.name === 'triangle-top') {
        const triangleY = mouseY - section.y;
        const triangleProgress = triangleY / section.height;
        const triangleWidthAtY = section.width * triangleProgress;
        const triangleStartX = section.x + (section.width - triangleWidthAtY) / 2;
        const triangleEndX = triangleStartX + triangleWidthAtY;
        return mouseX >= triangleStartX && mouseX <= triangleEndX && 
               mouseY >= section.y && mouseY <= section.y + section.height;
      } else if (section.name === 'dome') {
        const centerX = section.x + section.width / 2;
        const centerY = section.y + section.height;
        const radius = section.width / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
        );
        return distanceFromCenter <= radius && mouseY <= centerY;
      } else {
        return mouseX >= section.x && mouseX <= section.x + section.width &&
               mouseY >= section.y && mouseY <= section.y + section.height;
      }
    });
    
    if (isOverChaithya) {
      setZoomLens({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        centerX: mouseX,
        centerY: mouseY,
      });
    } else {
      setZoomLens(prev => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setZoomLens(prev => ({ ...prev, visible: false }));
  };

  const handleCompletePayment = async () => {
    if (cart.length === 0) return;

    setIsProcessingPayment(true);

    try {
      // Prepare payment data
      const paymentData = {
        items: cart.map(item => ({
          id: item.brick.id,
          section: item.brick.section,
          price: item.brick.price,
        })),
        metadata: {
          donationType: 'chaithya_bricks',
          totalBricks: cart.length.toString(),
          timestamp: new Date().toISOString(),
        },
      };

      // Create payment session
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-800 mb-4">
            🙏 Build the Sacred Chaithya 🙏
          </h1>
          <p className="text-base sm:text-lg text-amber-700 max-w-3xl mx-auto px-4">
            Join us in building this sacred stupa brick by brick. Each brick represents your contribution to spreading peace, wisdom, and compassion. Hover over different sections to explore and click on individual bricks to sponsor them.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Chaithya Visualization */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 relative overflow-hidden mb-8">
              {/* Sacred Progress Summary - Inside Stupa Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6 border border-amber-200">
                <div className="text-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-amber-800 mb-1">
                    🧱 Sacred Brick Progress
                  </h2>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Total Bricks */}
                  <div className="bg-white rounded-lg p-3 shadow text-center">
                    <div className="text-xl sm:text-2xl font-bold text-amber-600 mb-1">134,500</div>
                    <div className="text-xs font-semibold text-gray-600 uppercase">Total</div>
                  </div>
                  
                  {/* Sponsored Bricks */}
                  <div className="bg-white rounded-lg p-3 shadow text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{sponsoredCount.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-gray-600 uppercase">Sponsored</div>
                  </div>
                  
                  {/* Available Bricks */}
                  <div className="bg-white rounded-lg p-3 shadow text-center">
                    <div className="text-xl sm:text-2xl font-bold text-amber-600 mb-1">{availableCount.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-gray-600 uppercase">Available</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="bg-white rounded-full p-1 shadow-inner">
                    <div className="relative">
                      <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {progressPercentage.toFixed(2)}% Complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-[400px] sm:h-[500px] lg:h-[700px] mx-auto w-full max-w-[600px] ">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 600 700"
                  className="absolute inset-0"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    touchAction: 'manipulation',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Background gradient */}
                  <defs>
                    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef3c7" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                  </defs>
                  <rect width="600" height="550" fill="url(#bg)" opacity="0.1" />

                  {/* Render each section */}
                  {chaithyaSections.map((section) => (
                    <g
                      key={section.name}
                      className={`transition-transform duration-300 origin-center cursor-pointer ${getSectionZoom(section.name)}`}
                      onMouseEnter={() => setHoveredSection(section.name)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      {/* Section background - different shape for each part */}
                      {section.name === 'triangle-top' ? (
                        <polygon
                          points={`${section.x + section.width/2},${section.y} ${section.x},${section.y + section.height} ${section.x + section.width},${section.y + section.height}`}
                          fill="rgba(251, 191, 36, 0.1)"
                          stroke="rgba(251, 191, 36, 0.3)"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                      ) : section.name === 'dome' ? (
                        <path
                          d={`M ${section.x} ${section.y + section.height} 
                              Q ${section.x + section.width/2} ${section.y} 
                              ${section.x + section.width} ${section.y + section.height} 
                              Z`}
                          fill="rgba(251, 191, 36, 0.1)"
                          stroke="rgba(251, 191, 36, 0.3)"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                      ) : (
                        <rect
                          x={section.x}
                          y={section.y}
                          width={section.width}
                          height={section.height}
                          fill="rgba(251, 191, 36, 0.1)"
                          stroke="rgba(251, 191, 36, 0.3)"
                          strokeWidth="2"
                          rx="4"
                          className="transition-all duration-300"
                        />
                      )}
                      
                      {/* Render bricks for this section - only when hovered */}
                      {hoveredSection === section.name && allBricks
                        .filter(brick => {
                          if (brick.section !== section.name) return false;
                          
                          // If zoom lens is visible, only show bricks within the zoom area
                          if (zoomLens.visible) {
                            const brickCenterX = brick.x + brick.width / 2;
                            const brickCenterY = brick.y + brick.height / 2;
                            const distance = Math.sqrt(
                              Math.pow(brickCenterX - zoomLens.centerX, 2) + 
                              Math.pow(brickCenterY - zoomLens.centerY, 2)
                            );
                            return distance <= 60;
                          }
                          
                          return true;
                        })
                        .map((brick) => {
                          const isInCart = isBrickInCart(brick.id);
                          let fillColor = '#f59e0b'; // Default amber for available
                          let strokeColor = '#d97706';
                          
                          if (brick.donated) {
                            fillColor = '#10b981'; // Green for donated
                            strokeColor = '#059669';
                          } else if (isInCart) {
                            fillColor = '#3b82f6'; // Blue for in cart
                            strokeColor = '#1d4ed8';
                          }
                          
                          return (
                            <rect
                              key={`${brick.id}-${isInCart ? 'cart' : 'available'}`} // Force re-render on cart change
                              x={brick.x}
                              y={brick.y}
                              width={brick.width}
                              height={brick.height}
                              fill={fillColor}
                              stroke={strokeColor}
                              strokeWidth="1"
                              rx="2"
                              className={`transition-all duration-200 ${
                                brick.donated 
                                  ? 'cursor-not-allowed opacity-60' 
                                  : 'cursor-pointer hover:opacity-80'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBrickClick(brick);
                              }}
                              onTouchStart={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBrickClick(brick);
                              }}
                              style={{
                                touchAction: 'manipulation',
                                WebkitTapHighlightColor: 'transparent',
                                // Force hardware acceleration on mobile
                                transform: 'translateZ(0)',
                                backfaceVisibility: 'hidden'
                              }}
                            />
                          );
                        })}
                      
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
                
                {/* Zoom Lens */}
                {zoomLens.visible && (
                  <div
                    className="fixed pointer-events-none z-50 transition-all duration-150 ease-out"
                    style={{
                      left: zoomLens.x - 100,
                      top: zoomLens.y - 100,
                      width: 200,
                      height: 200,
                      transform: 'translate3d(0, 0, 0)', // Hardware acceleration
                    }}
                  >
                    <div className="relative w-full h-full">
                      {/* Outer ring shadow */}
                      <div className="absolute inset-0 rounded-full bg-black/20 blur-md scale-110"></div>
                      
                      {/* Main lens container */}
                      <div className="absolute inset-2 rounded-full border-4 border-amber-400 shadow-2xl bg-white overflow-hidden backdrop-blur-sm">
                        {/* Lens content */}
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <svg
                            width="100%"
                            height="100%"
                            viewBox={`${zoomLens.centerX - 50} ${zoomLens.centerY - 50} 100 100`}
                            className="w-full h-full"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            {/* Enhanced background for zoom lens */}
                            <defs>
                              <radialGradient id="zoomBg" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#fef3c7" />
                                <stop offset="100%" stopColor="#f59e0b" />
                              </radialGradient>
                              
                              {/* Enhanced brick texture pattern */}
                              <pattern id="brickTexture" patternUnits="userSpaceOnUse" width="6" height="6">
                                <rect width="6" height="6" fill="rgba(245, 158, 11, 0.05)"/>
                                <circle cx="3" cy="3" r="0.8" fill="rgba(0,0,0,0.08)"/>
                                <rect x="1.5" y="1.5" width="3" height="3" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.3"/>
                                <circle cx="1" cy="1" r="0.3" fill="rgba(0,0,0,0.03)"/>
                                <circle cx="5" cy="5" r="0.3" fill="rgba(0,0,0,0.03)"/>
                              </pattern>
                              
                              {/* Mortar pattern for realistic brick look */}
                              <pattern id="mortarPattern" patternUnits="userSpaceOnUse" width="20" height="12">
                                <rect width="20" height="12" fill="rgba(139, 69, 19, 0.1)"/>
                                <rect x="0" y="0" width="20" height="1" fill="rgba(139, 69, 19, 0.2)"/>
                                <rect x="0" y="11" width="20" height="1" fill="rgba(139, 69, 19, 0.2)"/>
                                <rect x="0" y="0" width="1" height="12" fill="rgba(139, 69, 19, 0.15)"/>
                                <rect x="10" y="0" width="1" height="12" fill="rgba(139, 69, 19, 0.15)"/>
                              </pattern>
                            </defs>
                            
                            <rect 
                              x={zoomLens.centerX - 50} 
                              y={zoomLens.centerY - 50} 
                              width="100" 
                              height="100" 
                              fill="url(#zoomBg)" 
                              opacity="0.1" 
                            />

                            {/* Render all bricks in the zoom area with enhanced detail */}
                            {allBricks
                              .filter(brick => {
                                const brickCenterX = brick.x + brick.width / 2;
                                const brickCenterY = brick.y + brick.height / 2;
                                const distance = Math.sqrt(
                                  Math.pow(brickCenterX - zoomLens.centerX, 2) + 
                                  Math.pow(brickCenterY - zoomLens.centerY, 2)
                                );
                                
                                // Only show bricks within zoom radius AND within valid chaithya structure
                                if (distance > 60) return false;
                                
                                // Find which section this brick belongs to and validate it's within that section's shape
                                const section = chaithyaSections.find(s => s.name === brick.section);
                                if (!section) return false;
                                
                                // Apply the same shape validation logic used in generateBricks
                                if (section.name === 'triangle-top') {
                                  // Triangle shape: narrower at top, wider at bottom
                                  const triangleY = brick.y - section.y;
                                  const triangleProgress = triangleY / section.height;
                                  const triangleWidthAtY = section.width * triangleProgress;
                                  const triangleStartX = section.x + (section.width - triangleWidthAtY) / 2;
                                  const triangleEndX = triangleStartX + triangleWidthAtY;
                                  
                                  return brick.x >= triangleStartX && brick.x + brick.width <= triangleEndX;
                                } else if (section.name === 'dome') {
                                  // Half-circle dome shape
                                  const centerX = section.x + section.width / 2;
                                  const centerY = section.y + section.height;
                                  const radius = section.width / 2;
                                  
                                  // Check if brick center is within the dome
                                  const distanceFromDomeCenter = Math.sqrt(
                                    Math.pow(brickCenterX - centerX, 2) + Math.pow(brickCenterY - centerY, 2)
                                  );
                                  return distanceFromDomeCenter <= radius && brickCenterY <= centerY;
                                } else {
                                  // Rectangle shapes (upper-rectangle and base-rectangle)
                                  return brick.x + brick.width <= section.x + section.width && 
                                         brick.y + brick.height <= section.y + section.height &&
                                         brick.x >= section.x && brick.y >= section.y;
                                }
                              })
                              .map((brick) => {
                                const isInCart = isBrickInCart(brick.id);
                                let fillColor = '#f59e0b';
                                let strokeColor = '#d97706';
                                
                                if (brick.donated) {
                                  fillColor = '#10b981';
                                  strokeColor = '#059669';
                                } else if (isInCart) {
                                  fillColor = '#3b82f6';
                                  strokeColor = '#1d4ed8';
                                }
                                
                                return (
                                  <g key={`zoom-${brick.id}`}>
                                    {/* Brick shadow */}
                                    <rect
                                      x={brick.x + 0.5}
                                      y={brick.y + 0.5}
                                      width={brick.width}
                                      height={brick.height}
                                      fill="rgba(0,0,0,0.2)"
                                      rx="2"
                                    />
                                    {/* Main brick */}
                                    <rect
                                      x={brick.x}
                                      y={brick.y}
                                      width={brick.width}
                                      height={brick.height}
                                      fill={fillColor}
                                      stroke={strokeColor}
                                      strokeWidth="1.5"
                                      rx="2"
                                    />
                                    {/* Brick highlight */}
                                    <rect
                                      x={brick.x + 1}
                                      y={brick.y + 1}
                                      width={brick.width - 2}
                                      height="2"
                                      fill="rgba(255,255,255,0.3)"
                                      rx="1"
                                    />
                                  </g>
                                );
                              })}

                            {/* Add realistic texture overlay */}
                            <rect 
                              x={zoomLens.centerX - 50} 
                              y={zoomLens.centerY - 50} 
                              width="100" 
                              height="100" 
                              fill="url(#brickTexture)" 
                              opacity="0.4"
                            />
                            
                            {/* Add mortar pattern overlay */}
                            <rect 
                              x={zoomLens.centerX - 50} 
                              y={zoomLens.centerY - 50} 
                              width="100" 
                              height="100" 
                              fill="url(#mortarPattern)" 
                              opacity="0.2"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Lens glass effect - multiple layers for realism */}
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute inset-4 rounded-full bg-gradient-to-tl from-transparent via-white/20 to-white/30 pointer-events-none"></div>
                      
                      {/* Lens frame reflection */}
                      <div className="absolute inset-2 rounded-full border-2 border-gradient-to-br from-amber-300 to-amber-600"></div>
                      
                      {/* Center crosshair with enhanced visibility */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                        <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-amber-600 transform -translate-y-1/2 rounded-full shadow-sm"></div>
                        <div className="absolute left-1/2 top-1 bottom-1 w-0.5 bg-amber-600 transform -translate-x-1/2 rounded-full shadow-sm"></div>
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-amber-700 transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                      </div>
                      
                      {/* Zoom indicator */}
                      <div className="absolute bottom-1 right-2 text-xs font-bold text-amber-700 bg-white/80 px-1 py-0.5 rounded backdrop-blur-sm">
                        {/* 2.5x */}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-1 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">Legend</h3>
                <div className="flex justify-center space-x-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-3 bg-amber-500 border border-amber-600 rounded-sm"></div>
                    <span className="text-gray-700 text-sm">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-3 bg-blue-500 border border-blue-600 rounded-sm"></div>
                    <span className="text-gray-700 text-sm">In Cart</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-3 bg-green-500 border border-green-600 rounded-sm"></div>
                    <span className="text-gray-700 text-sm">Donated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80 w-full">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">🛒 Your Cart</h3>
                <span className="bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                  {cart.length}
                </span>
              </div>
              
              <div className="mb-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🧱</div>
                    <p className="text-gray-500">
                      No bricks selected yet
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
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
                        <div key={section.name} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-800 capitalize">
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
                            <span className="text-sm text-gray-600">
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
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">Total Bricks:</span>
                      <span className="font-bold text-gray-800">{cart.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-800">Total Amount:</span>
                      <span className="font-bold text-2xl text-amber-600">Rs.{getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Complete Sacred Donation 🙏'
                    )}
                  </button>
                  
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      🔒 Secure Payment • Tax Deductible
                    </p>
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                      TEST MODE: Use card 4242 4242 4242 4242 for testing
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
