(function() {
  const clutterSelectors = [
    '.ad', '.advertisement', '[class*="ad"]', '[id*="ad"]',
    '.sidebar', '[class*="sidebar"]', '[id*="sidebar"]',
    '.header', '.footer', 'nav', 'aside'
  ];
  
  clutterSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.display = 'none !important';
      el.style.visibility = 'hidden !important';
    });
  });
  
  document.body.style.cssText = `
    max-width: 800px; margin: 0 auto; padding: 20px;
    font-size: 18px; line-height: 1.6; background: #fff; color: #000;
  `;
})();
