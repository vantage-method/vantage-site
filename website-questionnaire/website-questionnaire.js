/* Header hide-on-scroll */
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

/* Website Questionnaire — Netlify Forms AJAX submit */
(function () {
    var form = document.getElementById('wq-form');
    if (!form) return;

    var V = window.VantageValidation || {};
    var submitBtn = form.querySelector('.s-form-submit');
    var successEl = document.getElementById('wq-form-success');
    var errorEl = document.getElementById('wq-form-error');

    function encode(data) {
        return Object.keys(data).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }).join('&');
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        var container = field.closest('.form-group') || field.closest('.radio-group');
        var errorSpan = container && (container.querySelector('.field-error') || container.querySelector('.group-error'));
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('visible');
        }
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        var container = field.closest('.form-group') || field.closest('.radio-group');
        var errorSpan = container && (container.querySelector('.field-error') || container.querySelector('.group-error'));
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('visible');
        }
    }

    function validate() {
        var valid = true;

        form.querySelectorAll('input[required], textarea[required]').forEach(function (field) {
            clearFieldError(field);
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required.');
                valid = false;
            } else if (field.type === 'email' && V.isValidEmail && !V.isValidEmail(field.value)) {
                showFieldError(field, 'Please enter a valid email address.');
                valid = false;
            }
        });

        form.querySelectorAll('.radio-group[data-required="true"]').forEach(function (migrationGroup) {
            var checked = migrationGroup.querySelector('input[type="radio"]:checked');
            var errorSpan = migrationGroup.querySelector('.group-error');
            if (!checked) {
                if (errorSpan) {
                    errorSpan.textContent = 'Please choose one option.';
                    errorSpan.classList.add('visible');
                }
                valid = false;
            } else if (errorSpan) {
                errorSpan.textContent = '';
                errorSpan.classList.remove('visible');
            }
        });

        return valid;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate()) {
            var firstError = form.querySelector('.error, .group-error.visible');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        var data = {};
        new FormData(form).forEach(function (value, key) {
            data[key] = value;
        });

        fetch(window.location.pathname, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode(data)
        }).then(function () {
            form.style.display = 'none';
            successEl.style.display = 'flex';
        }).catch(function () {
            errorEl.style.display = 'flex';
        }).finally(function () {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        });
    });
})();
