const fs = require('fs');
const pages = ['MyFarm', 'CropIntelligence', 'SeasonAdvisor', 'Weather', 'DiseaseDetection', 'SoilAnalysis', 'MarketPrices', 'FarmAI', 'Schemes', 'YieldPrediction', 'Alerts', 'Profile', 'Settings'];
pages.forEach(p => {
  const content = `import React from 'react';\n\nconst ${p} = () => {\n  return (\n    <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>\n      <h2 style={{ color: '#166534' }}>${p} Module</h2>\n      <p style={{ color: '#627168' }}>This module is under construction.</p>\n    </div>\n  );\n};\n\nexport default ${p};`;
  fs.writeFileSync('src/pages/' + p + '.jsx', content);
});
