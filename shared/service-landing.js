/* ============================================
   SERVICE LANDING PAGES JS
   Header hide-on-scroll, reveals, sticky CTA, form submit
   ============================================ */

(function () {
    var lastScroll = 0;
    var header = document.querySelector('header');
    if (!header) return;

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

(function () {
    var reveals = document.querySelectorAll('.s-reveal');
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

/* Sticky CTA bar: show after 500px scroll, hide when final CTA section in view */
(function () {
    var stickyBar = document.getElementById('s-sticky-cta');
    var ctaSection = document.querySelector('.s-cta');
    if (!stickyBar || !ctaSection) return;

    var showAfter = 500;

    function updateSticky() {
        var scrollY = window.scrollY;
        var ctaRect = ctaSection.getBoundingClientRect();
        var ctaInView = ctaRect.top < window.innerHeight;
        if (scrollY > showAfter && !ctaInView) {
            stickyBar.classList.add('visible');
        } else {
            stickyBar.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', updateSticky, { passive: true });
    window.addEventListener('resize', updateSticky);
    updateSticky();
})();

/* Service landing form submission (GHL + reCAPTCHA v3) */
(function () {
    var form = document.getElementById('service-lead-form');
    if (!form) return;

    var RECAPTCHA_SITE_KEY = '6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX';
    var submitBtn = form.querySelector('.s-form-submit');
    var successEl = document.getElementById('service-form-success');
    var errorEl = document.getElementById('service-form-error');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function clearErrors() {
        form.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });
        form.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('visible'); });
    }

    function showFieldError(input, message) {
        input.classList.add('error');
        var errEl = input.parentNode.querySelector('.field-error');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.add('visible');
        }
    }

    function validate() {
        clearErrors();
        var valid = true;
        var firstName = form.querySelector('[name="first_name"]');
        if (!firstName || !firstName.value.trim()) {
            if (firstName) showFieldError(firstName, 'First name is required.');
            valid = false;
        }
        var lastName = form.querySelector('[name="last_name"]');
        if (!lastName || !lastName.value.trim()) {
            if (lastName) showFieldError(lastName, 'Last name is required.');
            valid = false;
        }
        var email = form.querySelector('[name="email"]');
        if (!email || !email.value.trim()) {
            if (email) showFieldError(email, 'Email is required.');
            valid = false;
        } else if (email && !emailRe.test(email.value.trim())) {
            showFieldError(email, 'Please enter a valid email.');
            valid = false;
        }
        return valid;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!validate()) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        if (errorEl) errorEl.style.display = 'none';

        try {
            var captchaToken = '';
            if (window.grecaptcha) {
                captchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
            }
            var raw = new FormData(form);
            var formDataObj = Object.fromEntries(raw.entries());
            var payload = new FormData();
            payload.set('formData', JSON.stringify(formDataObj));
            payload.set('captchaV3', captchaToken);

            var res = await fetch('https://backend.leadconnectorhq.com/forms/submit', {
                method: 'POST',
                body: payload
            });
            var json = await res.json();

            if (!res.ok) throw new Error(json.message || 'Submission failed');

            form.style.display = 'none';
            if (successEl) successEl.style.display = 'flex';
        } catch (err) {
            console.error('Form submission error:', err);
            if (errorEl) errorEl.style.display = 'flex';
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    form.querySelectorAll('input, textarea').forEach(function (el) {
        el.addEventListener('input', function () {
            this.classList.remove('error');
            var errEl = this.parentNode.querySelector('.field-error');
            if (errEl) errEl.classList.remove('visible');
        });
    });
})();

/* Vanta.js TRUNK background in hero (same as main site hero) */
(function () {
    var el = document.getElementById('s-vantaBg');
    if (!el) return;

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
            el: '#s-vantaBg',
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
        setTimeout(function () {
            if (effect && effect.camera) effect.camera.position.y = 150;
        }, 100);
    }

    function start() {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js', function () {
            loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.trunk.min.js', initVanta);
        });
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(start);
    } else {
        setTimeout(start, 100);
    }
})();
