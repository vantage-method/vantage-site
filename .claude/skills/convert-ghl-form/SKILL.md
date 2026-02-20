---
name: convert-ghl-form
description: Convert raw GoHighLevel (GHL) form HTML into the clean form format used on the Vantage Method site, preserving GHL field name/id attributes for proper submission.
---

# Convert GHL Form

Convert a raw GoHighLevel (GHL) form HTML export into the clean form format used on the Vantage Method site.

## Instructions

1. Ask the user for the file path containing the raw GHL form HTML (or they may have already provided it as an argument).
2. Read that file.
3. Parse the GHL form and extract every field, preserving:
   - `name` attribute (the GHL custom field ID, e.g. `ktpvKytJ9wXqQSJZXJiY`) — this MUST stay exactly the same
   - `id` attribute — keep the same as the GHL source
   - `data-q` attribute — keep this for GHL mapping
   - `data-required` attribute — use this to determine if the field is required
   - `value` attribute on hidden/prefilled fields
4. Also extract the hidden fields that GHL needs:
   - `formId` — the GHL form ID
   - `location_id` — the GHL location ID
   - Any consent/terms checkbox `name` attributes
5. Convert into the site's clean form format following the patterns below.

## Output Format

The converted form should follow this exact structure. Use the reference form at `sections/cta/cta.html` as the canonical example.

### Hidden fields go first, right after `<form>`:
```html
<input type="hidden" name="formId" value="THE_FORM_ID">
<input type="hidden" name="location_id" value="THE_LOCATION_ID">
```

### For fields that should be hidden from the user but still submitted (like a page source tracker):
```html
<input type="text" placeholder="" name="GHL_FIELD_ID" class="form-control" id="GHL_FIELD_ID" data-q="GHL_DATA_Q" data-required="false" value="THE_VALUE" hidden>
```

### Standard text/email/tel fields:
```html
<div class="form-group">
    <label for="FIELD_ID">Human Label <span class="required">*</span></label>
    <input type="TYPE" id="FIELD_ID" name="GHL_FIELD_NAME" required autocomplete="AUTOCOMPLETE_HINT" placeholder="PLACEHOLDER">
    <span class="field-error"></span>
</div>
```
- Only add `<span class="required">*</span>` and the `required` attribute if `data-required="true"` in the GHL source.
- Only add `autocomplete` if the field maps to a standard autocomplete value.

### Pair fields side by side using form-row (first+last name, email+phone):
```html
<div class="form-row">
    <div class="form-group">...</div>
    <div class="form-group">...</div>
</div>
```

### Textarea fields:
```html
<div class="form-group">
    <label for="FIELD_ID">Human Label</label>
    <textarea id="FIELD_ID" name="GHL_FIELD_NAME" rows="4" placeholder="PLACEHOLDER"></textarea>
    <span class="field-error"></span>
</div>
```

### Consent checkboxes:
```html
<div class="form-consent">
    <label class="consent-label">
        <input type="checkbox" name="GHL_CHECKBOX_NAME" id="READABLE_ID">
        <span>Consent text here.</span>
    </label>
    <p class="consent-legal">By submitting this form, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.</p>
</div>
```

### Submit button:
```html
<button type="submit" class="cta-button" id="ctaButton">
    <span class="btn-text">Request an Evaluation</span>
    <span class="btn-loading" aria-hidden="true">
        <svg class="spinner" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"
                stroke-dasharray="40" stroke-dashoffset="10" stroke-linecap="round" />
        </svg>
        Sending...
    </span>
</button>
```

### reCAPTCHA notice (always include at end of form):
```html
<p class="recaptcha-notice">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Terms of Service</a> apply.</p>
```

## Field Mapping Hints

When converting GHL field labels to clean HTML, apply smart defaults:

| GHL Label Contains | `type` | `autocomplete` | Placeholder |
|---|---|---|---|
| first name | `text` | `given-name` | `First Name` |
| last name | `text` | `family-name` | `Last Name` |
| email | `email` | `email` | `email@company.com` |
| phone | `tel` | `tel` | `(555) 555-5555` |
| business, company, organization | `text` | `organization` | `Your Company` |
| message, help, comment | `textarea` | — | `Tell us about your business and what you're looking for...` |

## Row Pairing Rules

- First Name + Last Name -> same `form-row`
- Email + Phone -> same `form-row`
- All other fields get their own `div.form-group` (not wrapped in `form-row`)

## After Conversion

- Write the converted HTML to the same file (overwriting the raw GHL HTML)
- Show the user a summary of fields found and converted
- Remind them to verify the `formId` and `location_id` values are correct
- Note: the form JS submission handler is in `sections/cta/cta.js` (home page) or `shared/service-landing.js` (landing pages) — no JS changes should be needed as long as field `name` attributes are preserved
