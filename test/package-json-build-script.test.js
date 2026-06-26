/**
 * Tests for the root package.json build script.
 *
 * PR change: added `--include=dev` to the frontend `npm install` step so that
 * devDependencies (e.g. vite) are available when running `npm run build`.
 *
 * Old: npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
 * New: npm install --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const buildScript = pkg.scripts?.build ?? '';

// Split the compound command into individual steps for easier assertion.
const steps = buildScript.split('&&').map((s) => s.trim());

describe('package.json build script', () => {
  it('defines a build script', () => {
    assert.ok(buildScript, 'scripts.build must be a non-empty string');
  });

  it('consists of exactly three ordered steps', () => {
    assert.equal(
      steps.length,
      3,
      `Expected 3 steps separated by &&, got ${steps.length}: ${JSON.stringify(steps)}`,
    );
  });

  describe('step 1 – backend dependency installation', () => {
    it('installs backend dependencies first', () => {
      assert.equal(steps[0], 'npm install --prefix backend');
    });

    it('does NOT include --include=dev for the backend install', () => {
      assert.ok(
        !steps[0].includes('--include=dev'),
        'Backend install should not have --include=dev flag',
      );
    });
  });

  describe('step 2 – frontend dependency installation with devDependencies', () => {
    it('installs frontend dependencies second', () => {
      assert.match(steps[1], /--prefix frontend/);
    });

    it('uses --include=dev so devDependencies (vite, etc.) are installed', () => {
      assert.ok(
        steps[1].includes('--include=dev'),
        `Expected "--include=dev" in frontend install step, got: "${steps[1]}"`,
      );
    });

    it('is exactly the expected frontend install command', () => {
      assert.equal(steps[1], 'npm install --include=dev --prefix frontend');
    });

    // Regression: the old command omitted --include=dev and caused build
    // failures because vite was not available as a devDependency.
    it('regression – old frontend install command (without --include=dev) is absent', () => {
      assert.notEqual(
        steps[1],
        'npm install --prefix frontend',
        'Old command without --include=dev must not be used for the frontend',
      );
    });
  });

  describe('step 3 – frontend build', () => {
    it('runs the frontend build last', () => {
      assert.equal(steps[2], 'npm run build --prefix frontend');
    });

    it('does not alter the build command itself', () => {
      assert.ok(
        steps[2].startsWith('npm run build'),
        `Build step should start with "npm run build", got: "${steps[2]}"`,
      );
    });
  });

  describe('overall build script integrity', () => {
    it('contains --include=dev exactly once', () => {
      const occurrences = (buildScript.match(/--include=dev/g) ?? []).length;
      assert.equal(
        occurrences,
        1,
        `"--include=dev" should appear exactly once in the build script, found ${occurrences}`,
      );
    });

    it('the --include=dev flag appears only in the frontend install step', () => {
      // Make sure it is in step[1] and nowhere else.
      assert.ok(steps[1].includes('--include=dev'));
      assert.ok(!steps[0].includes('--include=dev'));
      assert.ok(!steps[2].includes('--include=dev'));
    });

    it('preserves the backend-first, frontend-second ordering', () => {
      const backendIndex = steps.findIndex((s) => s.includes('--prefix backend') && s.includes('install'));
      const frontendInstallIndex = steps.findIndex((s) => s.includes('--prefix frontend') && s.includes('install'));
      const frontendBuildIndex = steps.findIndex((s) => s.includes('--prefix frontend') && s.includes('build'));

      assert.ok(backendIndex !== -1, 'Backend install step must exist');
      assert.ok(frontendInstallIndex !== -1, 'Frontend install step must exist');
      assert.ok(frontendBuildIndex !== -1, 'Frontend build step must exist');

      assert.ok(
        backendIndex < frontendInstallIndex,
        'Backend install must come before frontend install',
      );
      assert.ok(
        frontendInstallIndex < frontendBuildIndex,
        'Frontend install must come before frontend build',
      );
    });

    it('does not use --omit=dev (which would undo the intent of --include=dev)', () => {
      assert.ok(
        !buildScript.includes('--omit=dev'),
        'Build script must not include --omit=dev',
      );
    });
  });
});