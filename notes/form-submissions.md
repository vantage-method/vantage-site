We're going to go with Option 1 from the options below on how to get form submissions into GHL.

We will need to capture the following:
First Name
Last Name
Email
Phone Number
Business Name
How can we help you?

We will need to capture this on a page - either on this home page or on a contact us page - but we can't do it in a modal or we will fail a2p registration. Eventually we may move it to a modal, but no initially.

## Option 1 – Custom form posting to GHL’s form submission endpoint

GHL doesn’t publish “submit a form” API docs, but people are successfully posting to the same backend endpoint GHL’s own forms use:
`https://backend.leadconnectorhq.com/forms/submit`.​

Core idea:

- Your HTML form includes all the same fields (name, email, phone, etc.) that your GHL form has.
- On submit, intercept with JS, build a `FormData`, then send a POST where all the fields are wrapped in a `formData` key as JSON.

Example JS (in your Netlify site):

```
xml
<form id="lead-form">
  <input name="first_name" required />
  <input name="last_name" />
  <input name="email" type="email" required />
  <input name="phone" />
  <!-- any custom fields using their GHL IDs -->
  <button type="submit">Submit</button>
</form>

<script>
  document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const raw = new FormData(e.target);
    const payload = new FormData();
    payload.set('formData', JSON.stringify(Object.fromEntries(raw.entries())));

    const res = await fetch('https://backend.leadconnectorhq.com/forms/submit', {
      method: 'POST',
      body: payload
    });

    const json = await res.json();
    // handle success/error UI here
  });
</script>
```

Notes:

- For **custom fields**, you must use their internal IDs (e.g. `IvYfCvMkhGap6sTe1Uql`) rather than human‑readable names.
- This behaves like a native GHL form: submission shows under the contact’s Activity, with attribution, etc..
- You’ll need the exact field keys from the GHL form you’re mimicking (inspect in builder/DOM).

Use when: you want GHL to treat this like a real form submission (for attributions, etc.) and you’re OK hitting their undocumented but widely used endpoint.

------

## Option 2 – Netlify Function → GoHighLevel Contacts API

If you’d rather use a documented API, hit the Contacts endpoint and then trigger GHL workflows from “Contact Created/Updated”.

## 2.1 Set up Netlify function

In your repo:

- `/netlify/functions/create-ghl-contact.js` (or `.ts`)
- `netlify.toml` to wire functions:

```
text
[build]
  functions = "netlify/functions"
```

`create-ghl-contact.js`:

```
js
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID; // if needed

    const res = await fetch(
      'https://services.leadconnectorhq.com/contacts/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          email: body.email,
          phone: body.phone,
          firstName: body.firstName,
          lastName: body.lastName,
          // optional: locationId: ghlLocationId,
          customField: {
            // example: tag the source
            // 'sourceCustomFieldId': 'website-netlify-form'
          }
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('GHL error', res.status, data);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: 'Failed to create contact', details: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, contact: data }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
```

- API base and “Create Contact” schema are from the official HighLevel API docs.

Store `GHL_API_KEY` (Marketplace API key) and any IDs as Netlify environment variables.

## 2.2 Front‑end form

```
xml
<form id="lead-form">
  <input name="firstName" required />
  <input name="lastName" />
  <input name="email" type="email" required />
  <input name="phone" />
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    email: form.email.value,
    phone: form.phone.value
  };

  const res = await fetch('/.netlify/functions/create-ghl-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  // handle UI states
});
</script>
```

## 2.3 GHL side

- Create a workflow with a trigger: “Contact Created” or “Contact Changed – filter by custom field / source tag”.
- Apply tags or pipeline stages based on the “source” custom field or tag set from the function.

Use when: you want full control, logging, and a documented endpoint, and you don’t need attribution as “form submission” per se.


## Verification

 1. node build.js — confirm clean build
 2. python3 -m http.server 3333 — test locally
 3. Scroll to #contact — question cards animate, form renders in glassmorphism card
 4. Submit empty form — inline validation errors appear on required fields
 5. Submit valid form — loading spinner, then success/error message
 6. Nav "Book a Call" → opens /booking page
 7. Hero "Book A Call" → opens /booking page
 8. Nav "Contact" → scrolls to form section
 9. Pricing buttons → scroll to form section
 10. /booking page loads with header, placeholder card, back link
 11. Mobile: form goes single-column, all 9 nav links stagger correctly