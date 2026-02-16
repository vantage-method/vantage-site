/* Header hide-on-scroll */
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
