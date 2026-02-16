/* =============================================
   PORTFOLIO SECTION – JavaScript
   Drag-scroll, filters, metric counters,
   video hover-play, lightbox, scroll reveal
   ============================================= */
(function () {
    const section   = document.querySelector('.pf-section');
    if (!section) return;

    const header    = section.querySelector('.pf-header');
    const filters   = section.querySelector('.pf-filters');
    const gallery   = document.getElementById('pfGallery');
    const track     = document.getElementById('pfTrack');
    const cards     = Array.from(track.querySelectorAll('.pf-card'));
    const pills     = Array.from(section.querySelectorAll('.pf-pill'));
    const hint      = section.querySelector('.pf-scroll-hint');

    /* --------------------------------------------------
       1.  DRAG-TO-SCROLL
       -------------------------------------------------- */
    let isDragging = false, hasMoved = false, startX = 0, scrollLeft = 0, velocity = 0, lastX = 0, rafId = null;

    function onPointerDown(e) {
        isDragging = true;
        hasMoved = false;
        startX = e.pageX || e.touches[0].pageX;
        scrollLeft = gallery.scrollLeft;
        lastX = startX;
        velocity = 0;
        cancelAnimationFrame(rafId);
    }
    function onPointerMove(e) {
        if (!isDragging) return;
        const x = e.pageX || (e.touches && e.touches[0].pageX);
        if (!hasMoved && Math.abs(x - startX) > 5) {
            hasMoved = true;
            gallery.classList.add('dragging');
        }
        if (!hasMoved) return;
        e.preventDefault();
        const walk = (x - startX) * 1.4;
        gallery.scrollLeft = scrollLeft - walk;
        velocity = x - lastX;
        lastX = x;
    }
    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        gallery.classList.remove('dragging');
        // momentum
        function coast() {
            if (Math.abs(velocity) > 0.5) {
                gallery.scrollLeft -= velocity;
                velocity *= 0.94;
                rafId = requestAnimationFrame(coast);
            }
        }
        coast();
    }

    gallery.addEventListener('mousedown', onPointerDown);
    gallery.addEventListener('mousemove', onPointerMove);
    gallery.addEventListener('mouseup', onPointerUp);
    gallery.addEventListener('mouseleave', onPointerUp);
    gallery.addEventListener('touchstart', onPointerDown, { passive: true });
    gallery.addEventListener('touchmove', onPointerMove, { passive: false });
    gallery.addEventListener('touchend', onPointerUp);


    /* --------------------------------------------------
       2.  FILTER PILLS
       -------------------------------------------------- */
    function applyFilter(cat) {
        cards.forEach(function (card) {
            if (cat === 'all' || card.getAttribute('data-cat') === cat) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Reset scroll
        gallery.scrollLeft = 0;
        revealCards();
    }

    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            pills.forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            const cat = pill.getAttribute('data-filter');
            applyFilter(cat);
        });
    });

    // Apply initial filter (based on the pill marked active in HTML)
    (function () {
        var active = section.querySelector('.pf-pill.active');
        if (!active) return;
        var cat = active.getAttribute('data-filter') || 'all';
        applyFilter(cat);
    })();

    /* --------------------------------------------------
       3.  SCROLL-REVEAL
       -------------------------------------------------- */
    let revealed = false;

    function reveal() {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && !revealed) {
            revealed = true;
            header.classList.add('visible');
            filters.classList.add('visible');
            revealCards();
        }
    }

    function revealCards() {
        const visibleCards = cards.filter(function (c) { return !c.classList.contains('hidden'); });
        visibleCards.forEach(function (card, i) {
            card.classList.remove('visible');
            setTimeout(function () {
                card.classList.add('visible');
            }, 80 * i);
        });
    }

    window.addEventListener('scroll', reveal, { passive: true });
    reveal();

    /* --------------------------------------------------
       4.  METRIC COUNTER ANIMATION
       -------------------------------------------------- */
    let countersStarted = false;

    function animateCounters() {
        if (countersStarted) return;
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight) return;
        countersStarted = true;

        section.querySelectorAll('.pf-metric-value').forEach(function (el) {
            const target  = parseFloat(el.getAttribute('data-target'));
            const suffix  = el.getAttribute('data-suffix') || '';
            const prefix  = el.getAttribute('data-prefix') || '';
            const decimal = parseInt(el.getAttribute('data-decimal')) || 0;
            const duration = 1600;
            const start = performance.now();

            function tick(now) {
                const t = Math.min((now - start) / duration, 1);
                // ease-out expo
                const ease = 1 - Math.pow(1 - t, 4);
                const val = (target * ease).toFixed(decimal);
                el.textContent = prefix + val + suffix;
                if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    window.addEventListener('scroll', animateCounters, { passive: true });

    /* --------------------------------------------------
       5.  VIDEO CARDS (hover state only — no local video)
       -------------------------------------------------- */
    const videoCards = section.querySelectorAll('.pf-card--video');

    /* --------------------------------------------------
       6.  LIGHTBOX (supports Vimeo embeds + local video)
       -------------------------------------------------- */
    // Create lightbox element
    const lb = document.createElement('div');
    lb.className = 'pf-lightbox';
    lb.innerHTML = '<button class="pf-lightbox-close">&times;</button><div class="pf-lightbox-content"></div>';
    document.body.appendChild(lb);
    const lbContent = lb.querySelector('.pf-lightbox-content');
    const lbClose   = lb.querySelector('.pf-lightbox-close');

    function openLightbox(card) {
        lbContent.innerHTML = '';

        // Check for Vimeo embed
        var vimeoId = card.getAttribute('data-vimeo');
        if (vimeoId) {
            var iframe = document.createElement('iframe');
            iframe.src = 'https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&title=0&byline=0&portrait=0';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            lbContent.style.position = 'relative';
            lbContent.style.width = '80vw';
            lbContent.style.maxWidth = '1200px';
            lbContent.style.paddingBottom = '56.25%'; /* 16:9 */
            lbContent.style.height = '0';
            lbContent.appendChild(iframe);
        } else {
            // Fallback: local video
            var vid = card.querySelector('.pf-video');
            if (vid) {
                var clone = vid.cloneNode(true);
                clone.controls = true;
                clone.muted = false;
                clone.autoplay = true;
                clone.style.width = '100%';
                lbContent.style.position = '';
                lbContent.style.width = '';
                lbContent.style.maxWidth = '';
                lbContent.style.paddingBottom = '';
                lbContent.style.height = '';
                lbContent.appendChild(clone);
                clone.play().catch(function () {});
            }
        }

        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lb.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () {
            lbContent.innerHTML = '';
            lbContent.style.position = '';
            lbContent.style.width = '';
            lbContent.style.maxWidth = '';
            lbContent.style.paddingBottom = '';
            lbContent.style.height = '';
        }, 400);
    }

    videoCards.forEach(function (card) {
        card.addEventListener('click', function () {
            if (gallery.classList.contains('dragging')) return;
            openLightbox(card);
        });
    });

    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });

    /* --------------------------------------------------
       7.  HIDE HINT AFTER SCROLL
       -------------------------------------------------- */
    if (hint) {
        gallery.addEventListener('scroll', function () {
            if (gallery.scrollLeft > 50) {
                hint.style.opacity = '0';
                hint.style.pointerEvents = 'none';
            } else {
                hint.style.opacity = '';
                hint.style.pointerEvents = '';
            }
        });
    }

})();
