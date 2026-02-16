/* ============================================
   HERO SECTION JS
   Rotating text animation & deferred Vanta.js trunk init
   ============================================ */

// Hero rotating text animation
(function() {
    var phrases = document.querySelectorAll('.hero-rotating-phrase');
    var idx = 0;

    function rotate() {
        phrases[idx].classList.remove('active');
        setTimeout(function() {
            idx = (idx + 1) % phrases.length;
            phrases[idx].classList.add('active');
        }, 500);
    }

    if (phrases.length > 0) {
        phrases[0].classList.add('active');
        setInterval(rotate, 3500);
    }
})();

// Deferred Vanta.js TRUNK initialization
// Loads p5.js first (Vanta TRUNK depends on it at parse time), then vanta.js
(function() {
    var effect = null;

    function loadScript(src, cb) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        document.body.appendChild(s);
    }

    function initVanta() {
        if (effect || typeof VANTA === 'undefined') return;

        effect = VANTA.TRUNK({
            el: '#vantaBg',
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1.5,
            scaleMobile: 1.5,
            color: 0x14b1ab,
            backgroundColor: 0xffffff,
            spacing: 5,
            chaos: 8,
            speed: 0.2
        });

        setTimeout(function() {
            if (effect && effect.camera) effect.camera.position.y = 150;
        }, 100);
    }

    function start() {
        // p5 must be loaded before vanta — vanta.trunk captures p5 at parse time
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js', function() {
            loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.trunk.min.js', initVanta);
        });
    }

    // Load after first paint
    if ('requestIdleCallback' in window) {
        requestIdleCallback(start);
    } else {
        setTimeout(start, 100);
    }
})();
