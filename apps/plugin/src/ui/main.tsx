/**
 * main.tsx — UI thread entry point
 * Renders the Preact app into #root.
 */

import { h, render } from 'preact';
import { App } from './app';

const root = document.getElementById('root');
if (root) {
  render(h(App, null), root);
}
