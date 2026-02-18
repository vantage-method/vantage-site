/**
 * Build Script — Assembles index.html from template + section includes,
 * concatenates/minifies CSS, and strips HTML comments.
 *
 * Usage:  node build.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TEMPLATE = 'index.template.html';
const OUTPUT = 'index.html';
const INCLUDE_RE = /^(\s*)<!--\s*@include\s+([\w./-]+)\s*-->\s*$/;

// CSS files in load order (matches the original stylesheet order)
const CSS_FILES = [
    'shared/base.css',
    'sections/hero/hero.css',
    'sections/mountains/mountains.css',
    'sections/principles/principles.css',
    'sections/how-we-work/how-we-work.css',
    'sections/what-we-do/what-we-do.css',
    'sections/team/team.css',
    'sections/portfolio/portfolio.css',
    'sections/social-proof/social-proof.css',
    'sections/pricing/pricing.css',
    'sections/cta/cta.css'
];

const COMPILED_CSS = 'assets/compiled.css';

/* ── CSS build ───────────────────────────────────────────── */

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')        // strip comments
        .replace(/\s+/g, ' ')                     // collapse whitespace
        .replace(/\s*([{}:;,>~])\s*/g, '$1')       // trim around special chars (not + which calc() needs)
        .replace(/;}/g, '}')                      // drop trailing semicolons
        .trim();
}

function buildCSS() {
    console.log('CSS:');
    let combined = '';

    for (const file of CSS_FILES) {
        const full = path.join(__dirname, file);
        if (!fs.existsSync(full)) {
            console.error(`  ERROR: CSS file not found: ${file}`);
            process.exit(1);
        }
        combined += fs.readFileSync(full, 'utf8') + '\n';
    }

    const minified = minifyCSS(combined);
    fs.writeFileSync(path.join(__dirname, COMPILED_CSS), minified, 'utf8');

    const origKB = (combined.length / 1024).toFixed(1);
    const minKB = (minified.length / 1024).toFixed(1);
    const pct = (((combined.length - minified.length) / combined.length) * 100).toFixed(0);
    console.log(`  ${CSS_FILES.length} files → ${COMPILED_CSS}  (${origKB} KB → ${minKB} KB, −${pct}%)`);
}

/* ── HTML build ──────────────────────────────────────────── */

/**
 * Strip HTML comments from output.
 * Preserves content inside <script> and <style> blocks.
 */
function stripHTMLComments(html) {
    var result = '';
    var i = 0;
    while (i < html.length) {
        // Check for <script or <style blocks — pass through unchanged
        if (html[i] === '<') {
            var lower = html.slice(i, i + 8).toLowerCase();
            if (lower.startsWith('<script') || lower.startsWith('<style')) {
                var tagName = lower.startsWith('<script') ? 'script' : 'style';
                var endTag = '</' + tagName;
                var endIdx = html.toLowerCase().indexOf(endTag, i + 1);
                if (endIdx === -1) {
                    result += html.slice(i);
                    break;
                }
                // Include through the closing tag
                var closeTagEnd = html.indexOf('>', endIdx) + 1;
                result += html.slice(i, closeTagEnd);
                i = closeTagEnd;
                continue;
            }
        }

        // Check for HTML comment
        if (html.slice(i, i + 4) === '<!--') {
            var commentEnd = html.indexOf('-->', i + 4);
            if (commentEnd !== -1) {
                // Skip the comment and any trailing whitespace/newline
                i = commentEnd + 3;
                // Consume the newline after the comment if it's on its own line
                if (html[i] === '\n') i++;
                continue;
            }
        }

        result += html[i];
        i++;
    }
    return result;
}

function buildHTML() {
    console.log('HTML:');
    const template = fs.readFileSync(path.join(__dirname, TEMPLATE), 'utf8');

    // Replace @include directives with file contents
    const assembled = template.split('\n').map(line => {
        const match = line.match(INCLUDE_RE);
        if (!match) return line;

        const indent = match[1];
        const filePath = match[2];
        const fullPath = path.join(__dirname, filePath);

        if (!fs.existsSync(fullPath)) {
            console.error(`  ERROR: Include file not found: ${filePath}`);
            process.exit(1);
        }

        const content = fs.readFileSync(fullPath, 'utf8').trimEnd();
        return content.split('\n').map(l => l.length ? indent + l : '').join('\n');
    }).join('\n');

    // Strip HTML comments
    const stripped = stripHTMLComments(assembled);

    fs.writeFileSync(path.join(__dirname, OUTPUT), stripped, 'utf8');

    const includeCount = template.split('\n').filter(l => INCLUDE_RE.test(l)).length;
    const assembledKB = (assembled.length / 1024).toFixed(1);
    const strippedKB = (stripped.length / 1024).toFixed(1);
    console.log(`  ${includeCount} sections included`);
    console.log(`  Comments stripped: ${assembledKB} KB → ${strippedKB} KB`);
}

/* ── Cache-busting ───────────────────────────────────────── */

/**
 * Compute a short content hash from compiled CSS + all local JS files.
 * Appended as ?v=HASH to local asset URLs so browsers fetch fresh copies
 * whenever any source file changes.
 */
function computeBuildHash() {
    const hash = crypto.createHash('md5');
    hash.update(fs.readFileSync(path.join(__dirname, COMPILED_CSS), 'utf8'));
    const jsPattern = /src="((?:shared|sections)\/[^"]+\.js)"/g;
    const template = fs.readFileSync(path.join(__dirname, TEMPLATE), 'utf8');
    let m;
    while ((m = jsPattern.exec(template)) !== null) {
        const jsPath = path.join(__dirname, m[1]);
        if (fs.existsSync(jsPath)) {
            hash.update(fs.readFileSync(jsPath, 'utf8'));
        }
    }
    return hash.digest('hex').slice(0, 8);
}

function cacheBust(html, hash) {
    // Bust compiled CSS
    html = html.replace(
        'href="assets/compiled.css"',
        'href="assets/compiled.css?v=' + hash + '"'
    );
    // Bust local JS files (shared/ and sections/)
    html = html.replace(
        /src="((?:shared|sections)\/[^"]+\.js)"/g,
        'src="$1?v=' + hash + '"'
    );
    return html;
}

/* ── Run ─────────────────────────────────────────────────── */

buildCSS();
buildHTML();

const hash = computeBuildHash();
const outputPath = path.join(__dirname, OUTPUT);
const html = fs.readFileSync(outputPath, 'utf8');
const busted = cacheBust(html, hash);
fs.writeFileSync(outputPath, busted, 'utf8');
console.log(`Cache-bust: ?v=${hash} appended to local CSS/JS references.`);

console.log('Done.');
