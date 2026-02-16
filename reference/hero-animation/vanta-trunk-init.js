/**
 * Vanta.js TRUNK Animation Initialization
 * 3D animated background effect for hero and pricing sections
 * 
 * Dependencies:
 * - p5.js: https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js
 * - vanta.trunk.js: https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js
 */

// Initialize Vanta.js for Hero and Pricing sections
let vantaHeroEffect;
let vantaPricingEffect;

function initVanta() {
    // Hero section Vanta effect
    if (!vantaHeroEffect) {
        vantaHeroEffect = VANTA.TRUNK({
            el: ".hero",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.50,
            scaleMobile: 1.50,
            color: 0x14b1ab,           // Teal/turquoise color
            backgroundColor: 0xffffff,  // White background
            spacing: 5.00,
            chaos: 8.00,
            speed: 0.2
        });
        
        // Position camera higher for better view
        setTimeout(() => {
            if (vantaHeroEffect && vantaHeroEffect.camera) {
                vantaHeroEffect.camera.position.y = 150;
            }
        }, 100);
    }
    
    // Pricing section Vanta effect (same settings)
    if (!vantaPricingEffect) {
        vantaPricingEffect = VANTA.TRUNK({
            el: "#pricing",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.50,
            scaleMobile: 1.50,
            color: 0x14b1ab,
            backgroundColor: 0xffffff,
            spacing: 5.00,
            chaos: 8.00,
            speed: 0.2
        });
        
        // Position camera higher
        setTimeout(() => {
            if (vantaPricingEffect && vantaPricingEffect.camera) {
                vantaPricingEffect.camera.position.y = 150;
            }
        }, 100);
    }
}

// Initialize on load
initVanta();
