/* ============================================
   PARTNERSHIPS PAGE JS
   Header scroll + scroll-triggered reveals
   ============================================ */

// Header hide-on-scroll
(function () {
    var lastScroll = 0;
    var header = document.querySelector('header');
    window.addEventListener('scroll', function () {
        var scrollY = window.scrollY;
        if (scrollY > 100) {
            header.style.transform = scrollY > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = scrollY;
    }, { passive: true });
})();

// Scroll-triggered reveals
(function () {
    var reveals = document.querySelectorAll('.p-reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(function (el) {
        observer.observe(el);
    });
})();
