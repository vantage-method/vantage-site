/* ============================================
   KENNY LANDING PAGE JS
   Form submission and scroll animations
   ============================================ */

(function() {
    'use strict';

    // Smooth scroll animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate sections on scroll
    document.querySelectorAll('.kenny-about, .kenny-brings, .kenny-helps, .kenny-focus').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animateOnScroll.observe(section);
    });

    // Animate cards staggered
    const bringCards = document.querySelectorAll('.bring-card');
    bringCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    });

    const focusCards = document.querySelectorAll('.focus-card');
    focusCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    });

    const helpItems = document.querySelectorAll('.help-item');
    helpItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    });

    // Trigger animations when sections come into view
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.bring-card, .focus-card, .help-item');
                cards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) translateX(0)';
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.kenny-brings, .kenny-focus, .kenny-helps').forEach(section => {
        cardObserver.observe(section);
    });

})();

/* ============================================
   CONTACT FORM SUBMISSION
   Posts to GHL form submission endpoint
   with reCAPTCHA v3 token
   ============================================ */
(function () {
    var form = document.getElementById('kenny-lead-form');
    if (!form) return;

    var RECAPTCHA_SITE_KEY = '6LcjFrUqAAAAAKWxNXoIU9-wz3gEU0hqD9BNbLZw';

    var submitBtn = form.querySelector('button[type="submit"]');
    var successEl = document.getElementById('formSuccess');
    var errorEl = document.getElementById('formError');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function clearErrors() {
        form.querySelectorAll('.form-group').forEach(function (el) {
            el.classList.remove('error');
        });
        form.querySelectorAll('.field-error').forEach(function (el) {
            el.textContent = '';
        });
    }

    function showFieldError(input, message) {
        var group = input.closest('.form-group');
        if (group) {
            group.classList.add('error');
            var errEl = group.querySelector('.field-error');
            if (errEl) {
                errEl.textContent = message;
            }
        }
    }

    function validate() {
        clearErrors();
        var valid = true;

        var firstName = form.querySelector('[name="first_name"]');
        if (!firstName.value.trim()) {
            showFieldError(firstName, 'First name is required.');
            valid = false;
        }

        var lastName = form.querySelector('[name="last_name"]');
        if (!lastName.value.trim()) {
            showFieldError(lastName, 'Last name is required.');
            valid = false;
        }

        var email = form.querySelector('[name="email"]');
        if (!email.value.trim()) {
            showFieldError(email, 'Email is required.');
            valid = false;
        } else if (!emailRe.test(email.value.trim())) {
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
        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        try {
            // Get reCAPTCHA v3 token
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

            if (!res.ok) {
                throw new Error(json.message || 'Submission failed');
            }

            form.style.display = 'none';
            successEl.style.display = 'flex';

            // Scroll to success message
            successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error('Form submission error:', err);
            errorEl.style.display = 'flex';
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    // Clear errors on input
    form.querySelectorAll('input, textarea').forEach(function (el) {
        el.addEventListener('input', function () {
            var group = this.closest('.form-group');
            if (group) {
                group.classList.remove('error');
            }
        });
    });
})();
