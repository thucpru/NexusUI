// esbuild.config.js — NexusUI Figma Plugin bundler
// Separate builds: code.ts (Figma sandbox) and UI (Preact iframe)
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const isDev = isWatch;

// Ensure dist exists
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

/** Read UI HTML template and embed bundled JS + CSS */
async function buildUI() {
  // Bundle UI JS
  const jsResult = await esbuild.build({
    entryPoints: ['src/ui/main.tsx'],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2017'],
    minify: !isDev,
    sourcemap: isDev ? 'inline' : false,
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    inject: ['src/ui/preact-shim.js'],
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    define: {
      'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
    },
    external: [],
    plugins: [],
  });

  // Bundle CSS
  const cssResult = await esbuild.build({
    entryPoints: ['src/ui/styles/plugin-styles.css'],
    bundle: true,
    write: false,
    minify: !isDev,
  });

  const js = jsResult.outputFiles[0].text;
  const css = cssResult.outputFiles[0].text;

  // Read HTML template
  const htmlTemplate = fs.readFileSync('src/ui/index.html', 'utf8');

  // Inject CSS + JS inline
  const html = htmlTemplate
    .replace('</head>', `<style>${css}</style></head>`)
    .replace('</body>', `<script>${js}</script></body>`);

  fs.writeFileSync('dist/ui.html', html);

  // Bundle size check
  const totalBytes = Buffer.byteLength(html, 'utf8');
  const kb = (totalBytes / 1024).toFixed(1);
  console.log(`[ui] Built dist/ui.html — ${kb}KB`);
  if (totalBytes > 200 * 1024) {
    console.warn(`[ui] WARNING: Bundle exceeds 200KB target (${kb}KB)`);
  }
}

/** Build Figma sandbox code (no DOM, no browser globals) */
async function buildCode() {
  await esbuild.build({
    entryPoints: ['src/code.ts'],
    bundle: true,
    outfile: 'dist/code.js',
    format: 'iife',
    platform: 'browser',
    target: ['es2017'],
    minify: !isDev,
    sourcemap: isDev ? 'inline' : false,
    // Figma sandbox: no DOM — suppress browser globals
    define: {
      'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
    },
  });

  const size = fs.statSync('dist/code.js').size;
  console.log(`[code] Built dist/code.js — ${(size / 1024).toFixed(1)}KB`);
}

async function build() {
  try {
    await Promise.all([buildCode(), buildUI()]);
    console.log('[nexusui-plugin] Build complete.');
  } catch (err) {
    console.error('[nexusui-plugin] Build failed:', err);
    process.exit(1);
  }
}

if (isWatch) {
  // Simple watch mode — rebuild on file changes
  const { watch } = require('fs');
  build().then(() => {
    console.log('[nexusui-plugin] Watching for changes...');
    watch('src', { recursive: true }, (_event, filename) => {
      if (filename) {
        console.log(`[nexusui-plugin] Changed: ${filename}`);
        build();
      }
    });
  });
} else {
  build();
}
