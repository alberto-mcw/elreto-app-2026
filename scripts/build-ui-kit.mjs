#!/usr/bin/env node
/**
 * build-ui-kit.mjs
 * Minifica src/ui-kit.css → dist/ui-kit.css
 * Uso: node scripts/build-ui-kit.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src = resolve(root, 'src/ui-kit.css');
const distDir = resolve(root, 'dist');
const out = resolve(distDir, 'ui-kit.css');

// Read source
const css = readFileSync(src, 'utf8');

// Minify: strip comments, collapse whitespace, trim lines
const minified = css
  // Remove /* ... */ block comments
  .replace(/\/\*[\s\S]*?\*\//g, '')
  // Collapse runs of whitespace (spaces, tabs, newlines) to a single space
  .replace(/\s+/g, ' ')
  // Remove spaces around {, }, :, ;, ,
  .replace(/\s*{\s*/g, '{')
  .replace(/\s*}\s*/g, '}')
  .replace(/\s*:\s*/g, ':')
  .replace(/\s*;\s*/g, ';')
  .replace(/\s*,\s*/g, ',')
  // Restore space after : inside @import url(...) and similar
  .replace(/@import url\(/g, '@import url(')
  // Trim
  .trim();

// Ensure dist/ exists
mkdirSync(distDir, { recursive: true });

// Write
writeFileSync(out, minified, 'utf8');

const kb = (minified.length / 1024).toFixed(1);
console.log(`✓ dist/ui-kit.css  ${kb} KB`);
