// Generate SVG car illustration based on vehicle info
const generateCarSVG = (brand, model, year) => {
  // Generate a color based on brand/model for visual consistency
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFC107', '#795548'];
  let hash = 0;
  const str = `${brand}${model}${year || ''}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const color = colors[Math.abs(hash) % colors.length];
  
  const displayText = `${brand} ${model}${year ? ' ' + year : ''}`;
  const encodedText = displayText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // SVG car illustration
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="carGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="#f5f5f5"/>
      <g transform="translate(400, 300)">
        <rect x="-200" y="-80" width="400" height="120" rx="20" fill="url(#carGrad)"/>
        <rect x="-150" y="-140" width="300" height="80" rx="15" fill="url(#carGrad)"/>
        <polygon points="-150,-80 -80,-140 80,-140 150,-80" fill="#87CEEB" opacity="0.6"/>
        <rect x="-140" y="-130" width="120" height="60" rx="8" fill="#87CEEB" opacity="0.5"/>
        <rect x="20" y="-130" width="120" height="60" rx="8" fill="#87CEEB" opacity="0.5"/>
        <circle cx="-140" cy="40" r="35" fill="#2c2c2c"/>
        <circle cx="-140" cy="40" r="25" fill="#4a4a4a"/>
        <circle cx="-140" cy="40" r="15" fill="#2c2c2c"/>
        <circle cx="140" cy="40" r="35" fill="#2c2c2c"/>
        <circle cx="140" cy="40" r="25" fill="#4a4a4a"/>
        <circle cx="140" cy="40" r="15" fill="#2c2c2c"/>
        <ellipse cx="-200" cy="-20" rx="15" ry="25" fill="#FFEB3B"/>
        <ellipse cx="200" cy="-20" rx="15" ry="25" fill="#FFEB3B"/>
        <text x="0" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${color}">${encodedText}</text>
      </g>
    </svg>`;
  
  // Return as data URL
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Get vehicle image from external source
export const getVehicleImageFromExternal = async (req, res, next) => {
  try {
    const { brand, model, year } = req.query;
    
    if (!brand || !model) {
      return res.status(400).json({ error: 'Brand and model are required' });
    }
    
    // Generate SVG car illustration
    const svgImage = generateCarSVG(brand, model, year);
    
    res.json({ imageUrl: svgImage });
  } catch (error) {
    next(error);
  }
};

