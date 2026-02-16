/* ============================================
   CTA SECTION JS
   Mountain parallax + question card animations
   ============================================ */

(function() {
    // CTA Mountains Scroll Animation
    const ctaLeftMountain = document.querySelector('.cta-left-mountain');
    const ctaRightMountain = document.querySelector('.cta-right-mountain');
    const ctaSection = document.getElementById('contact');

    function updateCtaMountains() {
        if (!ctaSection) return;
        
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const sectionTop = ctaSection.offsetTop;
        const sectionHeight = ctaSection.offsetHeight;
        
        // Add visible class for highlight animation
        const sectionRect = ctaSection.getBoundingClientRect();
        if (sectionRect.top < windowHeight * 0.8 && !ctaSection.classList.contains('visible')) {
            ctaSection.classList.add('visible');
        }
        
        if (window.innerWidth <= 768) return;
        
        const scrollProgress = Math.max(0, Math.min(1, (scrollY - sectionTop + windowHeight) / (sectionHeight + windowHeight)));
        
        const startPosition = -300;
        const endPosition = -400;
        const currentPosition = startPosition + (scrollProgress * (endPosition - startPosition));
        
        if (ctaLeftMountain) ctaLeftMountain.style.bottom = `${currentPosition}px`;
        if (ctaRightMountain) ctaRightMountain.style.bottom = `${currentPosition}px`;
    }

    window.addEventListener('scroll', updateCtaMountains, { passive: true });
    window.addEventListener('resize', updateCtaMountains);
    updateCtaMountains();

    // CTA Questions Slide-in Animation
    const ctaQuestionCards = document.querySelectorAll('.cta-question-card');
    const ctaQuestionsContainer = document.getElementById('ctaQuestions');
    let questionsTriggered = false;
    
    function updateCtaQuestions() {
        if (!ctaQuestionsContainer || ctaQuestionCards.length === 0) return;

        const containerRect = ctaQuestionsContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (!questionsTriggered && containerRect.top < windowHeight * 0.85) {
            ctaQuestionCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 150);
            });
            questionsTriggered = true;
        }
        
        if (questionsTriggered && ctaQuestionsContainer && window.innerWidth > 768) {
            const containerRect = ctaQuestionsContainer.getBoundingClientRect();
            
            let progress = 0;
            if (containerRect.top < windowHeight) {
                progress = Math.min(1, Math.max(0, (windowHeight - containerRect.top) / (windowHeight * 0.5)));
            }
            
            const card1Margin = 0 + (progress * 15);
            ctaQuestionCards[0].style.marginLeft = `${card1Margin}%`;
            
            const card2Margin = 0 + (progress * 15);
            ctaQuestionCards[1].style.marginRight = `${card2Margin}%`;
            
            const card3Margin = 5 + (progress * 25);
            ctaQuestionCards[2].style.marginLeft = `${card3Margin}%`;
        }
    }
    
    window.addEventListener('scroll', updateCtaQuestions, { passive: true });
    updateCtaQuestions();
})();

/* ============================================
   CONTACT FORM SUBMISSION
   Posts to GHL form submission endpoint
   with reCAPTCHA v3 token
   ============================================ */
(function () {
    var form = document.getElementById('lead-form');
    if (!form) return;

    // TODO: Replace with your GHL reCAPTCHA v3 site key (must match the key in index.template.html)
    var RECAPTCHA_SITE_KEY = '6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX';

    var submitBtn = form.querySelector('button[type="submit"]');
    var successEl = document.getElementById('formSuccess');
    var errorEl = document.getElementById('formError');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function clearErrors() {
        form.querySelectorAll('.error').forEach(function (el) {
            el.classList.remove('error');
        });
        form.querySelectorAll('.field-error').forEach(function (el) {
            el.classList.remove('visible');
        });
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
        } catch (err) {
            console.error('Form submission error:', err);
            errorEl.style.display = 'flex';
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
