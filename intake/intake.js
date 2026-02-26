/* ============================================
   PARTNER INTAKE FORM
   Password gate, multi-step nav, conditional
   logic, validation, auto-save, GHL submission
   ============================================ */

(function () {
    /* ---- Constants ---- */
    var GATE_PASSWORD = 'letmein-vm';
    var RECAPTCHA_SITE_KEY = '6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX';
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var SAVE_KEY = 'intake_draft';
    var ACCESS_KEY = 'intake_access';

    /* ---- State ---- */
    var state = {
        currentStep: 1,
        aiStepVisible: false
    };

    /* ---- DOM Refs ---- */
    var gate = document.getElementById('passwordGate');
    var formContainer = document.getElementById('intakeFormContainer');
    var form = document.getElementById('intake-form');
    var progressFill = document.getElementById('progressFill');
    var progressLabel = document.getElementById('progressLabel');

    /* ============================================
       PASSWORD GATE
       ============================================ */

    (function initGate() {
        if (sessionStorage.getItem(ACCESS_KEY) === 'granted') {
            gate.style.display = 'none';
            formContainer.style.display = 'block';
            return;
        }

        var input = document.getElementById('gatePassword');
        var btn = document.getElementById('gateSubmit');
        var errEl = document.getElementById('gateError');

        function attempt() {
            if (input.value === GATE_PASSWORD) {
                sessionStorage.setItem(ACCESS_KEY, 'granted');
                gate.style.display = 'none';
                formContainer.style.display = 'block';
                restoreProgress();
            } else {
                errEl.textContent = 'Incorrect password. Check with your Vantage Method contact.';
                errEl.classList.add('visible');
                input.classList.add('error');
                input.value = '';
                input.focus();
            }
        }

        btn.addEventListener('click', attempt);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') attempt();
        });
        input.addEventListener('input', function () {
            errEl.classList.remove('visible');
            input.classList.remove('error');
        });
    })();

    /* ============================================
       STEP NAVIGATION
       ============================================ */

    function getVisibleSteps() {
        var steps = [1, 2];
        if (state.aiStepVisible) steps.push(3);
        steps.push(4, 5, 6, 7, 8);
        return steps;
    }

    function showStep(stepNum) {
        document.querySelectorAll('.intake-step').forEach(function (el) {
            el.classList.remove('active');
        });
        var target = document.querySelector('[data-step="' + stepNum + '"]');
        if (target) target.classList.add('active');
        state.currentStep = stepNum;
        updateProgressBar();
        document.querySelector('.intake-progress').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function nextStep() {
        if (!validateStep(state.currentStep)) return;
        var steps = getVisibleSteps();
        var idx = steps.indexOf(state.currentStep);
        if (idx < steps.length - 1) {
            showStep(steps[idx + 1]);
        }
        saveProgress();
    }

    function prevStep() {
        var steps = getVisibleSteps();
        var idx = steps.indexOf(state.currentStep);
        if (idx > 0) {
            showStep(steps[idx - 1]);
        }
        saveProgress();
    }

    function updateProgressBar() {
        var steps = getVisibleSteps();
        var idx = steps.indexOf(state.currentStep);
        var total = steps.length;
        var percent = ((idx + 1) / total) * 100;
        progressFill.style.width = percent + '%';
        progressLabel.textContent = 'Step ' + (idx + 1) + ' of ' + total;
    }

    // Attach nav button listeners
    document.querySelectorAll('.intake-btn-next').forEach(function (btn) {
        btn.addEventListener('click', nextStep);
    });
    document.querySelectorAll('.intake-btn-back').forEach(function (btn) {
        btn.addEventListener('click', prevStep);
    });

    /* ============================================
       CONDITIONAL LOGIC
       ============================================ */

    // AI Step (Step 3) — show if any AI checkbox in Q7 is checked
    function updateAIStepVisibility() {
        var aiCheckboxes = document.querySelectorAll('[data-ai="true"]');
        var anyChecked = false;
        aiCheckboxes.forEach(function (cb) {
            if (cb.checked) anyChecked = true;
        });
        state.aiStepVisible = anyChecked;
        updateProgressBar();
    }

    document.querySelectorAll('.intake-step[data-step="2"] input[type="checkbox"]').forEach(function (cb) {
        cb.addEventListener('change', updateAIStepVisibility);
    });

    // Q18 — show if Q17 starts with "Yes"
    document.querySelectorAll('input[name="previous_agency"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            var container = document.getElementById('q18-container');
            container.style.display = this.value.startsWith('Yes') ? 'block' : 'none';
        });
    });

    // Q22 — show if Q21 = "Yes (please describe below)"
    document.querySelectorAll('input[name="has_deadline"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            var container = document.getElementById('q22-container');
            container.style.display = this.value.startsWith('Yes') ? 'block' : 'none';
        });
    });

    // Q26 — show if Q25 = "Yes — I have a number in mind"
    document.querySelectorAll('input[name="has_ad_budget"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            var container = document.getElementById('q26-container');
            container.style.display = (this.value === 'Yes — I have a number in mind') ? 'block' : 'none';
        });
    });

    /* ============================================
       VALIDATION
       ============================================ */

    function clearStepErrors(step) {
        step.querySelectorAll('.error').forEach(function (el) {
            el.classList.remove('error');
        });
        step.querySelectorAll('.field-error').forEach(function (el) {
            el.classList.remove('visible');
            el.textContent = '';
        });
        step.querySelectorAll('.group-error').forEach(function (el) {
            el.classList.remove('visible');
            el.textContent = '';
        });
        step.querySelectorAll('.radio-group.error').forEach(function (el) {
            el.classList.remove('error');
        });
        step.querySelectorAll('.checkbox-group.error').forEach(function (el) {
            el.classList.remove('error');
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

    function showGroupError(group, message) {
        group.classList.add('error');
        var errEl = group.querySelector('.group-error');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.add('visible');
        }
    }

    function validateStep(stepNum) {
        var step = document.querySelector('[data-step="' + stepNum + '"]');
        if (!step) return true;
        clearStepErrors(step);
        var valid = true;

        // Required text/email/tel/url inputs
        step.querySelectorAll('input[required]:not([type="radio"]):not([type="checkbox"]):not([hidden])').forEach(function (input) {
            if (!input.value.trim()) {
                showFieldError(input, 'We need this one to give you a good estimate.');
                valid = false;
            }
        });

        // Email format
        step.querySelectorAll('input[type="email"][required]').forEach(function (input) {
            if (input.value.trim() && !emailRe.test(input.value.trim())) {
                showFieldError(input, 'Please enter a valid email.');
                valid = false;
            }
        });

        // Required textareas
        step.querySelectorAll('textarea[required]').forEach(function (ta) {
            if (!ta.value.trim()) {
                showFieldError(ta, 'We need this one to give you a good estimate.');
                valid = false;
            }
        });

        // Required radio groups
        step.querySelectorAll('.radio-group[data-required="true"]').forEach(function (group) {
            var selected = group.querySelector('input[type="radio"]:checked');
            if (!selected) {
                showGroupError(group, 'Pick one so we can tailor your plan.');
                valid = false;
            }
        });

        // Required checkbox groups (at least one)
        step.querySelectorAll('.checkbox-group[data-required="true"]').forEach(function (group) {
            var anyChecked = group.querySelector('input[type="checkbox"]:checked');
            if (!anyChecked) {
                showGroupError(group, 'Select at least one option.');
                valid = false;
            }
        });

        // Scroll to first error
        if (!valid) {
            var firstErr = step.querySelector('.error, .field-error.visible, .group-error.visible');
            if (firstErr) {
                firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return valid;
    }

    // Clear errors on input
    if (form) {
        form.addEventListener('input', function (e) {
            var el = e.target;
            if (el.classList.contains('error')) {
                el.classList.remove('error');
                var errEl = el.parentNode.querySelector('.field-error');
                if (errEl) errEl.classList.remove('visible');
            }
        });
        form.addEventListener('change', function (e) {
            var el = e.target;
            // Clear radio/checkbox group errors
            var group = el.closest('.radio-group, .checkbox-group');
            if (group && group.classList.contains('error')) {
                group.classList.remove('error');
                var errEl = group.querySelector('.group-error');
                if (errEl) errEl.classList.remove('visible');
            }
        });
    }

    /* ============================================
       AUTO-SAVE
       ============================================ */

    var saveTimer = null;

    function saveProgress() {
        var data = {};

        // Text inputs
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], textarea').forEach(function (el) {
            if (el.name && !el.hidden) data[el.name] = el.value;
        });

        // Radios
        form.querySelectorAll('input[type="radio"]:checked').forEach(function (el) {
            data['__radio__' + el.name] = el.value;
        });

        // Checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
            data['__cb__' + el.name + '__' + el.value] = el.checked;
        });

        data.__step = state.currentStep;
        sessionStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }

    function restoreProgress() {
        var saved = sessionStorage.getItem(SAVE_KEY);
        if (!saved) return;

        try {
            var data = JSON.parse(saved);
        } catch (e) {
            return;
        }

        // Restore text inputs
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], textarea').forEach(function (el) {
            if (el.name && !el.hidden && data[el.name] !== undefined) {
                el.value = data[el.name];
            }
        });

        // Restore radios
        form.querySelectorAll('input[type="radio"]').forEach(function (el) {
            var key = '__radio__' + el.name;
            if (data[key] === el.value) el.checked = true;
        });

        // Restore checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
            var key = '__cb__' + el.name + '__' + el.value;
            if (data[key] !== undefined) el.checked = data[key];
        });

        // Recalculate conditionals
        updateAIStepVisibility();
        updateConditionalFields();

        // Restore step
        if (data.__step) {
            // Make sure the step is valid
            var steps = getVisibleSteps();
            if (steps.indexOf(data.__step) !== -1) {
                showStep(data.__step);
            }
        }
    }

    function updateConditionalFields() {
        // Q18
        var agencyRadio = form.querySelector('input[name="previous_agency"]:checked');
        if (agencyRadio) {
            document.getElementById('q18-container').style.display = agencyRadio.value.startsWith('Yes') ? 'block' : 'none';
        }

        // Q22
        var deadlineRadio = form.querySelector('input[name="has_deadline"]:checked');
        if (deadlineRadio) {
            document.getElementById('q22-container').style.display = deadlineRadio.value.startsWith('Yes') ? 'block' : 'none';
        }

        // Q26
        var adBudgetRadio = form.querySelector('input[name="has_ad_budget"]:checked');
        if (adBudgetRadio) {
            document.getElementById('q26-container').style.display = (adBudgetRadio.value === 'Yes — I have a number in mind') ? 'block' : 'none';
        }
    }

    // Debounced save on input
    if (form) {
        form.addEventListener('input', function () {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(saveProgress, 500);
        });
        form.addEventListener('change', function () {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(saveProgress, 300);
        });
    }

    /* ============================================
       FORM SUBMISSION
       ============================================ */

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!validateStep(8)) return;

            var submitBtn = document.getElementById('intakeSubmitBtn');
            var errorEl = document.getElementById('intakeError');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            errorEl.style.display = 'none';

            try {
                // Get reCAPTCHA token
                var captchaToken = '';
                if (window.grecaptcha) {
                    captchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
                }

                // Collect all form data
                var raw = new FormData(form);
                var formDataObj = Object.fromEntries(raw.entries());

                // Checkbox fields need manual aggregation (FormData only gets last value)
                var checkboxFields = [
                    'services_requested',
                    'ai_current_tools',
                    'ai_work_requested',
                    'existing_assets',
                    'existing_accounts'
                ];

                checkboxFields.forEach(function (fieldName) {
                    var checked = form.querySelectorAll('input[name="' + fieldName + '"]:checked');
                    var values = [];
                    checked.forEach(function (cb) { values.push(cb.value); });
                    formDataObj[fieldName] = values.join(', ');
                });

                // Synthesize contact_name
                var firstName = (formDataObj.first_name || '').trim();
                var lastName = (formDataObj.last_name || '').trim();
                formDataObj.contact_name = (firstName + ' ' + lastName).trim();

                // Remove AI fields if section was skipped
                if (!state.aiStepVisible) {
                    var aiFields = ['ai_familiarity', 'ai_current_tools', 'ai_work_requested',
                        'ai_use_case', 'ai_primary_goal', 'ai_integration_needs', 'ai_daily_usage'];
                    aiFields.forEach(function (f) { delete formDataObj[f]; });
                }

                // Remove conditional field values if their containers are hidden
                if (document.getElementById('q18-container').style.display === 'none') {
                    delete formDataObj.previous_agency_details;
                }
                if (document.getElementById('q22-container').style.display === 'none') {
                    delete formDataObj.deadline_details;
                }
                if (document.getElementById('q26-container').style.display === 'none') {
                    delete formDataObj.ad_spend_amount;
                }

                // Build GHL payload
                var payload = new FormData();
                payload.set('formData', JSON.stringify(formDataObj));
                payload.set('captchaV3', captchaToken);

                var res = await fetch('https://backend.leadconnectorhq.com/forms/submit', {
                    method: 'POST',
                    body: payload
                });

                var json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Submission failed');

                // Success — clear draft and reset form for reuse
                sessionStorage.removeItem(SAVE_KEY);
                form.reset();
                state.aiStepVisible = false;
                form.style.display = 'none';
                document.querySelector('.intake-progress').style.display = 'none';
                document.querySelector('.intake-intro').style.display = 'none';
                document.getElementById('intakeSuccess').style.display = 'flex';
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

            } catch (err) {
                console.error('Intake form submission error:', err);
                errorEl.style.display = 'flex';
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

    /* ============================================
       INIT
       ============================================ */

    // If already authenticated, restore progress
    if (sessionStorage.getItem(ACCESS_KEY) === 'granted') {
        restoreProgress();
    }

    // Initialize progress bar
    updateProgressBar();
    updateAIStepVisibility();

})();
