/* ============================================
   PRINCIPLES SECTION JS
   Card reveal — triggers as soon as section enters viewport
   ============================================ */

(function() {
    var principleCards = document.querySelectorAll('.principle-card');
    var principlesSection = document.getElementById('principles');
    var triggered = false;

    if (!principlesSection || principleCards.length === 0) return;

    function revealCards() {
        if (triggered) return;

        var rect = principlesSection.getBoundingClientRect();
        var windowHeight = window.innerHeight;

        // Trigger when the top of the section is 80% down the viewport
        if (rect.top < windowHeight * 0.85) {
            triggered = true;
            principleCards.forEach(function(card, i) {
                setTimeout(function() {
                    card.classList.add('visible');
                }, i * 120);
            });
        }
    }

    window.addEventListener('scroll', revealCards, { passive: true });
    revealCards();
})();
