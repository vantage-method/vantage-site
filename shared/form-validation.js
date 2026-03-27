/* ============================================
   SHARED FORM VALIDATION
   Phone formatting, name checks, email regex
   ============================================ */

window.VantageValidation = (function () {
    'use strict';

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRe = /^\d{7,15}$/;
    var nameRe = /[a-zA-Z]{2}/; // must contain at least 2 letters

    function isValidEmail(val) {
        return emailRe.test(val.trim());
    }

    function isValidName(val) {
        var trimmed = val.trim();
        return trimmed.length > 0 && nameRe.test(trimmed);
    }

    function isValidPhone(val) {
        var digits = val.replace(/\D/g, '');
        if (!digits) return true; // empty is OK (phone is usually optional)
        return phoneRe.test(digits);
    }

    function formatPhone(val) {
        var digits = val.replace(/\D/g, '');
        // Strip leading 1 for US numbers
        if (digits.length === 11 && digits[0] === '1') {
            digits = digits.slice(1);
        }
        if (digits.length === 10) {
            return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
        }
        return val; // return as-is if not 10 digits
    }

    /**
     * Attach live phone formatting to an input element.
     * Strips non-digit chars as user types, auto-formats on blur.
     */
    function attachPhoneFormatting(input) {
        if (!input) return;

        input.addEventListener('input', function () {
            // Allow digits, parens, dashes, spaces, plus
            this.value = this.value.replace(/[^0-9()\-+\s]/g, '');
        });

        input.addEventListener('blur', function () {
            if (this.value.trim()) {
                this.value = formatPhone(this.value);
            }
        });
    }

    return {
        isValidEmail: isValidEmail,
        isValidName: isValidName,
        isValidPhone: isValidPhone,
        formatPhone: formatPhone,
        attachPhoneFormatting: attachPhoneFormatting
    };
})();
