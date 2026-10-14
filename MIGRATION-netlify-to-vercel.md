# Migration plan: vantagemethod.com from Netlify to Vercel

Written 2026-10-13 by Scott. Readers: Scott, Westin, and Westin's AI agent. Repo state: `vantage-site` at commit `d612378` on `main`.

## Decision

Move the `vantagemethod.com` marketing site from Netlify to Vercel, as a new project on the existing `vantage-method` Vercel team.

Why: Netlify Free is 300 credits/month and each production deploy costs 15 credits, so 20 deploys exhaust the month. The repo had 21 pushes to `main` in September and 12 in the first 13 days of October; deploy count alone exceeds the cap.

## Why Vercel over Railway

- Railway would need a running container (for example Caddy) to serve static files, plus a Dockerfile to maintain; Vercel serves `dist/` from its CDN with no runtime.
- Railway runs in a single region; Vercel serves from a global edge network.
- Both Vercel Pro and Railway Pro are already paid for, so cost is a wash; the difference is operational. Railway would add a container and a Dockerfile to look after without adding anything this site needs.
- Sister hostnames (`internal`, `sso`, `bethany`) already run on Vercel, so the team, billing, and DNS patterns are known.

## Costs

- Vercel: effectively $0 extra. Billing from Feb to Oct 2026 shows the account's spend is build CPU minutes on Next.js monorepo projects ($156), the Pro fee, and one extra seat. A `node build.js` build takes seconds, and all account data transfer over 8 months was 88 GB against a 1 TB allowance.
- Seats: no new seat needed. The repo is public and commits use one shared identity (`vantage-method-team`). Watch out: the pending `harveycreative` Developer access request on the team would add a $20/month seat if approved.
- Netlify: $0 after the site is deleted. Path C below ($9/month) only if the migration stalls.
- DNS: $0 on every path (Cloudflare Free or GoDaddy DNS included with the registration).

## The blocker: DNS

The domain is registered at GoDaddy in Westin's account. The nameservers are Cloudflare's (`arch.ns.cloudflare.com`, `selah.ns.cloudflare.com`). GoDaddy holds no zone file, so the domain-mgmt scripts return `UNKNOWN_DOMAIN` for this domain.

Nobody currently has the Cloudflare dashboard login (not Scott, not Westin). The zone was moved to Cloudflare so the Vantage Agent product's DNS broker could use a zone-scoped API token. That token may still exist in the agent's config and would be enough to edit records through the API without the dashboard.

Only two records change for this migration: the apex `A` and the `www` `CNAME`. 

### Cloudflare access status

Searched 2026-10-13 (repos, git history, Scott's mailbox). No token value was read or copied. Findings, strongest lead first:

1. **The API token is on the Hetzner production host.** The Vantage Agent bridge reads `config.cloudflare.token` from `bridge-config.json` in the bridge user's home directory (`vantage-agent/bridge/server.js:64-83`). The host is the Hetzner CPX21 in Ashburn described in `vantage-agent/infra/README.md:8-18`, reached over SSH as `vantage-bridge`. The tunnel credentials file at `/etc/cloudflared/edb80f3a-aaef-42d7-af19-be0909ac0fd0.json` on the same host carries the Cloudflare account ID. A zone-scoped token is enough to run every Path A API step; it cannot recover the dashboard login.
2. **The nameserver move is credited to Hamish.** `vantage-agent/bridge/setup-tunnel.sh:3` says "Prereq: vantagemethod.com zone ACTIVE on Cloudflare (Hamish's DNS migration)", and `docs/connections/domain.md:19` names Hamish and Westin as the people who purchase domains. If lead 1 fails, Hamish is the person to ask which email created the account.

Also learned: `agent.vantagemethod.com` is not on Railway. It is served from the Hetzner host through a Cloudflare Tunnel (`repos/vantage-agent/infra/cloudflared-config.yml`, which also routes `setup.` and `bridge-new.`). Tunnels belong to the Cloudflare account that created them, so Path B would also require recreating the tunnel in the new account and re-running the setup on the host. That makes Path A worth real effort before falling back to B.

### Current DNS record set (backup and restore reference)

Captured 2026-10-13 with `dig` against `arch.ns.cloudflare.com`. All TTL 300.

```
vantagemethod.com.            A     75.2.60.5                                   <- Netlify, CHANGE
www.vantagemethod.com.        CNAME apex-loadbalancer.netlify.com.              <- Netlify, CHANGE
vantagemethod.com.            MX    1 aspmx.l.google.com.
vantagemethod.com.            MX    5 alt1.aspmx.l.google.com.
vantagemethod.com.            MX    5 alt2.aspmx.l.google.com.
vantagemethod.com.            MX    10 alt3.aspmx.l.google.com.
vantagemethod.com.            MX    10 alt4.aspmx.l.google.com.
vantagemethod.com.            TXT   "v=spf1 include:dc-aa8e722993._spfm.vantagemethod.com ~all"
vantagemethod.com.            TXT   "google-site-verification=4dbu1Ga5HtAsVby0BCvqt6Q0FJSMlDpaXOFd5SB633A"
vantagemethod.com.            TXT   "google-site-verification=d_hn1wUx0wpkFrIKnFEtoAnYrb0n-GOu-4o23051Dao"
vantagemethod.com.            TXT   "google-site-verification=tPR8LDY7zTe5f2_VBd5Ap7uiB7c-kOvbduzPOJzI6qY"
dc-aa8e722993._spfm.vantagemethod.com. TXT "v=spf1 include:_spf.google.com ~all"
_dmarc.vantagemethod.com.     TXT   "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;"
google._domainkey.vantagemethod.com. TXT "v=DKIM1; k=rsa; p=..." (Google Workspace DKIM; full value must be exported before any zone move)
resend._domainkey.vantagemethod.com. TXT "p=..." (Resend DKIM; full value must be exported)
send.vantagemethod.com.       MX    10 feedback-smtp.us-east-1.amazonses.com.
send.vantagemethod.com.       TXT   "v=spf1 include:amazonses.com ~all"
internal.vantagemethod.com.   CNAME 0686609833e3073e.vercel-dns-017.com.
sso.vantagemethod.com.        CNAME e99457fbc16225fe.vercel-dns-017.com.
bethany.vantagemethod.com.    CNAME (Vercel, *.vercel-dns-016.com)
agent.vantagemethod.com.      A/AAAA Cloudflare-proxied (orange cloud); Cloudflare Tunnel to the Hetzner host
```

Caveat: this list came from probing about 80 common names, not from a zone export. Only a Cloudflare export (dashboard export or the API `GET dns_records` call below) is authoritative; there may be records we did not guess. The two DKIM values above are truncated. Before any nameserver change, capture them in full and save them under `repos/domain-mgmt/output/`:

```
dig +short TXT google._domainkey.vantagemethod.com @arch.ns.cloudflare.com
dig +short TXT resend._domainkey.vantagemethod.com @arch.ns.cloudflare.com
dig +short CNAME bethany.vantagemethod.com @arch.ns.cloudflare.com
```



## DNS paths, in order of preference



### Path A (preferred): edit the two records in the existing Cloudflare zone

Needs either the Cloudflare dashboard login or an API token with `Zone.DNS:Edit` on the `vantagemethod.com` zone. Smallest blast radius: two records change, nothing else is touched.

Where to look for the token (agent): the Vantage Agent config that holds `config.cloudflare.token`, and any `CLOUDFLARE_ZONE_ID` / `CLOUDFLARE_ACCOUNT_ID` / `DOMAIN_API_TOKEN` values in `repos/vantage-agent` deployment settings (see `vantage-agent/docs/connections/domain.md:18-20`). Check the token before using it: `curl -s -H "Authorization: Bearer $CF_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify` must return `"status": "active"`.

Via the API, in this order:

1. Get the zone id: `curl -s -H "Authorization: Bearer $CF_TOKEN" "https://api.cloudflare.com/client/v4/zones?name=vantagemethod.com"`. Read `result[0].id`.
2. Back up the full zone before changing anything.
3. The day before cutover, drop TTL to 60 on the apex `A` and the `www` `CNAME` (`PATCH` with `{"ttl": 60}`).
4. At cutover, find the two record ids in the backup (type `A` name `vantagemethod.com`; type `CNAME` name `www.vantagemethod.com`) and patch each: `curl -s -X PATCH -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" --data '{"content":"<value Vercel shows>","proxied":false,"ttl":60}'`.
5. After a day of stable traffic, raise TTL back to 300.

Note: Cloudflare fronts our own API with a non-browser-UA rule (`domain.md:33`). That applies to our API, not `api.cloudflare.com`, but if a scripted call to our endpoints gets error 1010, that is why.

Via the dashboard: dash.cloudflare.com > select `vantagemethod.com` > DNS > Records. Edit `A @` and `CNAME www` to the values Vercel shows, and set Proxy status to "DNS only" (grey cloud). Use Export (DNS > Records > Import and Export) first to save a backup.

Recovering the dashboard login: if we learn which email created the account, use "Forgot password" at dash.cloudflare.com. If the account has 2FA and nobody has the device or recovery codes, recovery goes through Cloudflare support and may take days.

### Path B (fallback, larger blast radius): move DNS off the unreachable Cloudflare account

Use only if Path A fails. Westin's GoDaddy account can change the nameservers. The domain shows `locked: true` and whois shows `clientUpdateProhibited`, so it must be unlocked in GoDaddy first and re-locked afterwards.

- GoDaddy DNS. Downside: the Vantage Agent DNS broker needs a Cloudflare zone, so it loses this domain.

### Path C (last resort): keep Netlify running

Upgrade Netlify to Personal, $9/month for 1,000 credits (about 66 production deploys). This needs no DNS change and buys time, but it is a stopgap only; the plan is still to finish Path A or B.

## Vercel setup

These steps can run before DNS access is solved. Nothing is visible to visitors until the DNS records change.

### 1. Add `vercel.json` to the repo root

Copy as-is. `cleanUrls` stays off (pages are `folder/index.html`, and `trailingSlash: true` gives `/book` -> `/book/` like Netlify does today). Redirects use `"statusCode": 301`, not `"permanent": true`, which would send 308. `dist/404.html` is used automatically for not-found responses. The header set is copied from `_headers:2-8` and `_headers:11-12`; cache rules are copied from `netlify.toml:86-116`, which limits the one-year `immutable` header to CSS and JS so the HTML partials in `shared/` are not cached for a year.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "",
  "buildCommand": "node build.js",
  "outputDirectory": "dist",
  "trailingSlash": true,
  "cleanUrls": false,
  "redirects": [
    { "source": "/kenny.html", "destination": "/kenny/", "statusCode": 301 },
    { "source": "/ken", "destination": "/kenny/", "statusCode": 301 },
    { "source": "/ken/:path*", "destination": "/kenny/:path*", "statusCode": 301 }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://player.vimeo.com https://links.wescotsolutions.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://vumbnail.com https://i.vimeocdn.com https://*.vimeocdn.com; media-src 'self'; font-src 'self' https://fonts.gstatic.com; frame-src https://www.google.com https://player.vimeo.com https://links.wescotsolutions.com; connect-src 'self' https://agent.vantagemethod.com https://backend.leadconnectorhq.com https://www.google.com https://www.gstatic.com; base-uri 'self'; form-action 'self' https://backend.leadconnectorhq.com; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
      ]
    },
    {
      "source": "/assets/images/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }]
    },
    {
      "source": "/sections/(.*)\\.(css|js)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/shared/(.*)\\.(css|js)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/bethany/(.*)",
      "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }]
    }
  ]
}
```

Not carried over on purpose: the 404 redirects for `/build.js`, `/netlify.toml`, `/scripts/*` and so on (`netlify.toml:5-70`). They are redundant because the publish directory is `dist/`, which `build.js` fills only from `PUBLISH_PATHS` and filters through `PRIVATE_PATTERNS` (`build.js:245-296`). The `/assets/videos/*` rule (`netlify.toml:91-94`) is dropped because that folder does not exist.

### 2. Repo cleanup (same PR as `vercel.json`)

- `build.js:247`: remove `'_headers'` from `PUBLISH_PATHS`, otherwise it ships as a public file on Vercel.
- `netlify.toml:135-148`: delete the `bethany.vantagemethod.com` host rewrites; that subdomain is already served by Vercel. (The whole file goes in step 7.)
- Netlify Forms: `website-questionnaire/crescent-project/index.html:51` and `website-questionnaire/just-disciple/index.html:51` use `data-netlify="true"`, submitted by `website-questionnaire/website-questionnaire.js:17`. On Vercel they would load fine but silently stop collecting. They were the July 2026 Bethany scoping intake and that work is done. First export any submissions from the Netlify dashboard (Site > Forms), then remove both pages (and the shared `website-questionnaire/` assets if `website-questionnaire/index.html` is also unused) and drop `website-questionnaire` from `PUBLISH_PATHS` if the folder goes.
- `privacy/index.html:85`: change "Netlify — Website hosting" to "Vercel — Website hosting".
- `README.md:3,25` and `CLAUDE.md:7,20`: replace "Hosted on Netlify" and the Netlify build line with Vercel and `vercel.json`. `CLAUDE.md:20` also wrongly says the publish directory is `.`; it is `dist`.
- Keep `netlify.toml` and `_headers` until Vercel is live and verified, so the Netlify site still builds correctly if we roll back.



### 3. Import the project in Vercel



### 4. Verify on the `*.vercel.app` URL, before any DNS change



### 5. Add the domains in Vercel



