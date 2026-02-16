/* ============================================
   HOW WE WORK SECTION JS
   Scroll-triggered step reveals
   ============================================ */

(function () {
    const header = document.querySelector('.hww-header');
    const steps  = document.querySelectorAll('.hww-step');
    if (!header || steps.length === 0) return;

    let headerRevealed = false;
    const stepsRevealed = new Array(steps.length).fill(false);

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

        /* Steps – staggered */
        steps.forEach((step, i) => {
            if (stepsRevealed[i]) return;
            const sTop = step.getBoundingClientRect().top;
            if (sTop < vh * 0.82) {
                setTimeout(() => step.classList.add('visible'), i * 180);
                stepsRevealed[i] = true;
            }
        });
    }

    window.addEventListener('scroll', reveal, { passive: true });
    reveal();           // in case already in view
})();
