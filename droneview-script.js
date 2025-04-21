document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const animateBtn = document.getElementById('animate-btn');
    const stopBtn = document.getElementById('stop-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const primaryColorInput = document.getElementById('primary-color');
    const secondaryColorInput = document.getElementById('secondary-color');
    const exportSvgBtn = document.getElementById('export-svg-btn');
    const svgCodeElement = document.getElementById('svg-code');
    const logoContainer = document.querySelector('.logo-container');
    
    // State
    let isAnimated = false;
    
    // Safely add event listeners by checking if elements exist
    if (animateBtn) animateBtn.addEventListener('click', startAnimation);
    if (stopBtn) stopBtn.addEventListener('click', stopAnimation);
    if (darkModeToggle) darkModeToggle.addEventListener('change', toggleDarkMode);
    if (primaryColorInput) primaryColorInput.addEventListener('input', updateColors);
    if (secondaryColorInput) secondaryColorInput.addEventListener('input', updateColors);
    if (exportSvgBtn) exportSvgBtn.addEventListener('click', exportAsSVG);
    
    // Functions
    function startAnimation() {
        const container = document.querySelector('.logo-container');
        if (container) {
            container.classList.add('animated');
            isAnimated = true;
        }
    }
    
    function stopAnimation() {
        const container = document.querySelector('.logo-container');
        if (container) {
            container.classList.remove('animated');
            isAnimated = false;
        }
    }
    
    function toggleDarkMode() {
        if (darkModeToggle) {
            document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        }
    }
    
    function updateColors() {
        // Only update if both inputs exist and have values
        const primaryColor = primaryColorInput && primaryColorInput.value ? primaryColorInput.value : '#1E88E5';
        const secondaryColor = secondaryColorInput && secondaryColorInput.value ? secondaryColorInput.value : '#0D47A1';
        
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    }
    
    function exportAsSVG() {
        // Get color values with fallbacks
        const primaryColor = primaryColorInput && primaryColorInput.value ? primaryColorInput.value : '#1E88E5';
        const secondaryColor = secondaryColorInput && secondaryColorInput.value ? secondaryColorInput.value : '#0D47A1';
        
        // Create an SVG representation of the drone logo
        const svgCode = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Drone Body -->
  <rect x="60" y="60" width="80" height="80" rx="20" fill="url(#bodyGradient)" />
  
  <!-- Drone Camera -->
  <circle cx="100" cy="100" r="10" fill="#333" stroke="#666" stroke-width="2" />
  
  <!-- Drone Arms -->
  <rect x="20" y="96" width="60" height="8" rx="4" fill="${primaryColor}" transform="rotate(-45 50 100)" />
  <rect x="20" y="96" width="60" height="8" rx="4" fill="${primaryColor}" transform="rotate(45 50 100)" />
  <rect x="120" y="96" width="60" height="8" rx="4" fill="${primaryColor}" transform="rotate(45 150 100)" />
  <rect x="120" y="96" width="60" height="8" rx="4" fill="${primaryColor}" transform="rotate(-45 150 100)" />
  
  <!-- Propellers -->
  <g transform="translate(34, 34)">
    <circle cx="0" cy="0" r="15" fill="rgba(0,0,0,0.1)" />
    <rect x="-15" y="-2.5" width="30" height="5" rx="2.5" fill="#666" />
    <rect x="-2.5" y="-15" width="5" height="30" rx="2.5" fill="#666" />
  </g>
  
  <g transform="translate(34, 166)">
    <circle cx="0" cy="0" r="15" fill="rgba(0,0,0,0.1)" />
    <rect x="-15" y="-2.5" width="30" height="5" rx="2.5" fill="#666" />
    <rect x="-2.5" y="-15" width="5" height="30" rx="2.5" fill="#666" />
  </g>
  
  <g transform="translate(166, 34)">
    <circle cx="0" cy="0" r="15" fill="rgba(0,0,0,0.1)" />
    <rect x="-15" y="-2.5" width="30" height="5" rx="2.5" fill="#666" />
    <rect x="-2.5" y="-15" width="5" height="30" rx="2.5" fill="#666" />
  </g>
  
  <g transform="translate(166, 166)">
    <circle cx="0" cy="0" r="15" fill="rgba(0,0,0,0.1)" />
    <rect x="-15" y="-2.5" width="30" height="5" rx="2.5" fill="#666" />
    <rect x="-2.5" y="-15" width="5" height="30" rx="2.5" fill="#666" />
  </g>
  
  <!-- Signal Waves -->
  <circle cx="100" cy="130" r="25" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.6" />
  <circle cx="100" cy="130" r="40" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.4" />
  
  <!-- Gradient Definitions -->
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
  </defs>
</svg>`;

        // Only proceed if svgCodeElement exists
        if (svgCodeElement) {
            svgCodeElement.textContent = svgCode;
            svgCodeElement.style.display = 'block';
        }
        
        try {
            // Create a blob and offer download
            const blob = new Blob([svgCode], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'droneview-logo.svg';
            a.style.display = 'none';
            document.body.appendChild(a);
            
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Error exporting SVG:', error);
            
            // Fallback method if the Blob approach fails
            const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
            const a = document.createElement('a');
            a.href = dataUri;
            a.download = 'droneview-logo.svg';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
            }, 100);
        }
    }
    
    // Initialize with default values
    updateColors();
});

// Add mouseover effects for the drone parts
document.addEventListener('DOMContentLoaded', function() {
    const droneBody = document.querySelector('.drone-body');
    const droneArms = document.querySelectorAll('.drone-arm');
    const propellers = document.querySelectorAll('.propeller');
    
    // Only add event listeners if elements exist
    if (droneBody) {
        droneBody.addEventListener('mouseover', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        droneBody.addEventListener('mouseout', function() {
            this.style.transform = 'translate(-50%, -50%)';
        });
    }
    
    if (droneArms && droneArms.length) {
        droneArms.forEach(arm => {
            arm.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'var(--secondary-color)';
            });
            
            arm.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'var(--primary-color)';
            });
        });
    }
    
    if (propellers && propellers.length) {
        propellers.forEach(prop => {
            prop.addEventListener('mouseover', function() {
                const logoContainer = document.querySelector('.logo-container');
                if (logoContainer && !logoContainer.classList.contains('animated')) {
                    this.style.transform = 'rotate(45deg)';
                }
            });
            
            prop.addEventListener('mouseout', function() {
                const logoContainer = document.querySelector('.logo-container');
                if (logoContainer && !logoContainer.classList.contains('animated')) {
                    this.style.transform = 'rotate(0deg)';
                }
            });
        });
    }
});