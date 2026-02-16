/* ============================================
   WHAT WE DO SECTION JS
   Scroll-triggered pillar reveals
   ============================================ */

(function () {
    const header  = document.querySelector('.wwd-header');
    const pillars = document.querySelectorAll('.wwd-pillar');
    if (!header || pillars.length === 0) return;

    let headerRevealed = false;
    const revealed = new Array(pillars.length).fill(false);

    function reveal() {
        const vh = window.innerHeight;

        /* Header */
        if (!headerRevealed) {
            const hTop = header.getBoundingClientRect().top;
            if (hTop < vh * 0.85) {
                header.classList.add('visible');
                headerRevealed = true;
            }
        }

        /* Pillar cards — staggered */
        pillars.forEach((p, i) => {
            if (revealed[i]) return;
            const pTop = p.getBoundingClientRect().top;
            if (pTop < vh * 0.82) {
                setTimeout(() => p.classList.add('visible'), i * 200);
                revealed[i] = true;
            }
        });
    }

    window.addEventListener('scroll', reveal, { passive: true });
    reveal();
})();
