#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import AxeBuilder from '@axe-core/playwright';
import { chromium, request as playwrightRequest, webkit } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const WEB_HOST = process.env.AUDIT_WEB_HOST ?? 'localhost';
const WEB_PORT = Number(process.env.AUDIT_WEB_PORT ?? 5173);
const WEB_ORIGIN = `http://${WEB_HOST}:${WEB_PORT}`;
const API_ORIGIN = process.env.AUDIT_API_ORIGIN ?? 'http://localhost:3000';
const buildEnv = {
  ...process.env,
  VITE_API_URL: API_ORIGIN,
  VITE_WS_URL: API_ORIGIN,
};

const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-430x932', width: 430, height: 932 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-820x1180', width: 820, height: 1180 },
];

const browserTargets = [
  { name: 'chromium', launcher: chromium },
  { name: 'webkit', launcher: webkit },
];

function timestamp() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

function decodeJwtPayload(token) {
  const base64 = token.split('.')[1] ?? '';
  const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const json = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(json);
}

function classifyIssueSeverity(issue) {
  if (issue.type === 'runtime-error') return 'P0';
  if (issue.type === 'route-unreachable') return 'P0';
  if (issue.type === 'horizontal-overflow') return 'P1';
  if (issue.type === 'network-error') {
    // /videos/:id/slides의 409는 아직 processing 상태에서 예상 가능한 응답으로 간주
    if (/^409\s+/.test(issue.detail) && /\/videos\/\d+\/slides(?:\?|$)/.test(issue.detail)) {
      return 'P3';
    }
    return 'P2';
  }
  if (issue.type === 'touch-target') return 'P2';
  if (issue.type === 'axe' && (issue.impact === 'critical' || issue.impact === 'serious')) {
    return 'P2';
  }
  return 'P3';
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function waitForHttpReady(url, timeoutMs = 60_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok || response.status === 404) return;
    } catch {
      // Ignore until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for server: ${url}`);
}

function startDevServer() {
  const child = spawn(
    'npm',
    ['run', 'preview', '--', '--host', WEB_HOST, '--port', String(WEB_PORT), '--strictPort'],
    {
      cwd: repoRoot,
      stdio: 'pipe',
      env: buildEnv,
    },
  );

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[vite] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[vite] ${chunk}`);
  });

  return child;
}

async function runBuild() {
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: buildEnv,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

async function bootstrapAuditFixtures() {
  const req = await playwrightRequest.newContext({
    baseURL: API_ORIGIN,
    ignoreHTTPSErrors: true,
  });

  try {
    const anonRes = await req.post('/session/anonymous');
    if (!anonRes.ok()) {
      throw new Error(`Anonymous session failed: ${anonRes.status()}`);
    }
    const anonBody = await anonRes.json();
    const accessToken = anonBody?.success?.accessToken;
    const refreshToken = anonBody?.success?.refreshToken;
    const sessionId = anonBody?.success?.sessionId;
    if (!accessToken || !sessionId) {
      throw new Error('Anonymous session response missing token/sessionId');
    }

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const samplePdfPath = path.resolve(repoRoot, 'public', 'thumbnails', 'p1.pdf');
    const samplePdf = fs.readFileSync(samplePdfPath);
    const uploadRes = await req.post('/files/upload', {
      headers: authHeaders,
      multipart: {
        title: `Mobile Tablet Audit ${new Date().toISOString()}`,
        file: {
          name: 'audit-sample.pdf',
          mimeType: 'application/pdf',
          buffer: samplePdf,
        },
      },
    });
    if (!uploadRes.ok()) {
      throw new Error(`File upload failed: ${uploadRes.status()}`);
    }
    const uploadBody = await uploadRes.json();
    const projectId = uploadBody?.success?.projectId;
    if (!projectId) {
      throw new Error('Upload response missing projectId');
    }

    const startVideoRes = await req.post('/videos/start', {
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      data: {
        projectId: Number(projectId),
        title: 'audit-video-processing',
      },
    });
    let videoId = null;
    if (startVideoRes.ok()) {
      const startVideoBody = await startVideoRes.json();
      videoId = startVideoBody?.success?.videoId ?? null;
    }

    const shareSlideRes = await req.post(`/presentations/${projectId}/shares`, {
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      data: {
        scope: 'slides_script',
      },
    });
    if (!shareSlideRes.ok()) {
      throw new Error(`Slide share creation failed: ${shareSlideRes.status()}`);
    }
    const shareSlideBody = await shareSlideRes.json();
    const shareSlideToken = shareSlideBody?.success?.shareToken;
    if (!shareSlideToken) {
      throw new Error('Share token missing for slides scope');
    }

    let shareVideoToken = null;
    const shareableVideosRes = await req.get(`/presentations/${projectId}/shares/videos`, {
      headers: authHeaders,
      params: { page: '1', pageSize: '10' },
    });
    if (shareableVideosRes.ok()) {
      const shareableVideosBody = await shareableVideosRes.json();
      const firstVideoId = shareableVideosBody?.success?.videos?.[0]?.id;
      if (firstVideoId) {
        const shareVideoRes = await req.post(`/presentations/${projectId}/shares`, {
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
          data: {
            scope: 'slides_script_video',
            videoId: firstVideoId,
          },
        });
        if (shareVideoRes.ok()) {
          const shareVideoBody = await shareVideoRes.json();
          shareVideoToken = shareVideoBody?.success?.shareToken ?? null;
        }
      }
    }

    const payload = decodeJwtPayload(accessToken);
    const user = {
      id: String(payload?.id ?? ''),
      email: String(payload?.email ?? ''),
      name: String(payload?.email ?? 'anonymous').split('@')[0],
      sessionId: String(payload?.sessionId ?? sessionId),
    };
    const authStorage = {
      state: {
        status: 'anonymous',
        user,
        accessToken,
        refreshToken: refreshToken ?? null,
        anonymousSessionId: sessionId,
      },
      version: 2,
    };

    const routes = [
      { id: 'home', path: '/' },
      { id: 'oauth-callback', path: '/auth/callback' },
      { id: 'slide', path: `/${projectId}/slide` },
      { id: 'insight', path: `/${projectId}/insight` },
      { id: 'videos', path: `/${projectId}/videos` },
      { id: 'video-detail', path: videoId ? `/${projectId}/videos/${videoId}` : `/${projectId}/videos/1` },
      { id: 'video-record', path: `/${projectId}/video/record` },
      { id: 'share-slide', path: `/share/${shareSlideToken}` },
    ];
    if (shareVideoToken) {
      routes.push({ id: 'share-video', path: `/share/${shareVideoToken}` });
    }

    return {
      projectId,
      videoId,
      shareSlideToken,
      shareVideoToken,
      routes,
      authStorage,
    };
  } finally {
    await req.dispose();
  }
}

async function run() {
  const startedAt = new Date();
  const stamp = timestamp();
  const rootArtifactsDir = path.resolve(repoRoot, 'artifacts', 'mobile-tablet-audit', stamp);
  const screenshotsDir = path.join(rootArtifactsDir, 'screenshots');
  const rawDir = path.join(rootArtifactsDir, 'raw');
  ensureDir(screenshotsDir);
  ensureDir(rawDir);

  await runBuild();
  const devServer = startDevServer();
  let auditSummary = null;

  try {
    await waitForHttpReady(WEB_ORIGIN);
    await waitForHttpReady(API_ORIGIN);

    const fixtures = await bootstrapAuditFixtures();
    const hasVideoShare = Boolean(fixtures.shareVideoToken);
    const allResults = [];
    const allIssues = [];

    for (const browserTarget of browserTargets) {
      const launchOptions =
        browserTarget.name === 'chromium'
          ? {
              headless: true,
              args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
            }
          : { headless: true };
      const browser = await browserTarget.launcher.launch(launchOptions);

      try {
        for (const viewport of viewports) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            permissions: browserTarget.name === 'chromium' ? ['camera', 'microphone'] : [],
            storageState: {
              cookies: [],
              origins: [
                {
                  origin: WEB_ORIGIN,
                  localStorage: [
                    {
                      name: 'auth-storage',
                      value: JSON.stringify(fixtures.authStorage),
                    },
                  ],
                },
              ],
            },
          });

          try {
            for (const route of fixtures.routes) {
              const page = await context.newPage();
              const result = {
                browser: browserTarget.name,
                viewport: viewport.name,
                routeId: route.id,
                path: route.path,
                url: `${WEB_ORIGIN}${route.path}`,
                consoleErrors: [],
                pageErrors: [],
                networkErrors: [],
                overflowX: null,
                touchTargetViolations: [],
                axeViolations: [],
              };

              page.on('console', (msg) => {
                if (msg.type() === 'error') result.consoleErrors.push(msg.text());
              });
              page.on('pageerror', (error) => {
                result.pageErrors.push(error.message);
              });
              page.on('response', (response) => {
                const status = response.status();
                if (status >= 400) {
                  result.networkErrors.push({
                    url: response.url(),
                    status,
                  });
                }
              });

              try {
                await page.goto(`${WEB_ORIGIN}${route.path}`, {
                  waitUntil: 'networkidle',
                  timeout: 40_000,
                });
              } catch (error) {
                allIssues.push({
                  type: 'route-unreachable',
                  browser: browserTarget.name,
                  viewport: viewport.name,
                  routeId: route.id,
                  path: route.path,
                  detail: error instanceof Error ? error.message : String(error),
                });
                await page.close();
                continue;
              }

              await page.waitForTimeout(600);

              const overflow = await page.evaluate(() => {
                const doc = document.documentElement;
                return Math.max(0, doc.scrollWidth - doc.clientWidth);
              });
              result.overflowX = overflow;
              if (overflow > 2) {
                allIssues.push({
                  type: 'horizontal-overflow',
                  browser: browserTarget.name,
                  viewport: viewport.name,
                  routeId: route.id,
                  path: route.path,
                  detail: `overflowX=${overflow}px`,
                });
              }

              const touchTargets = await page.evaluate(() => {
                const targets = Array.from(
                  document.querySelectorAll('button, a, input, textarea, select, [role="button"]'),
                );
                const violations = [];
                for (const el of targets) {
                  const style = window.getComputedStyle(el);
                  if (style.display === 'none' || style.visibility === 'hidden') continue;
                  const rect = el.getBoundingClientRect();
                  if (rect.width === 0 || rect.height === 0) continue;
                  if (rect.width < 44 || rect.height < 44) {
                    const label =
                      el.getAttribute('aria-label') ||
                      el.textContent?.trim() ||
                      el.tagName.toLowerCase();
                    violations.push({
                      label: label.slice(0, 80),
                      width: Math.round(rect.width),
                      height: Math.round(rect.height),
                    });
                  }
                }
                return violations.slice(0, 20);
              });
              result.touchTargetViolations = touchTargets;
              for (const violation of touchTargets) {
                allIssues.push({
                  type: 'touch-target',
                  browser: browserTarget.name,
                  viewport: viewport.name,
                  routeId: route.id,
                  path: route.path,
                  detail: `${violation.label} (${violation.width}x${violation.height})`,
                });
              }

              const axe = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa'])
                .analyze();
              result.axeViolations = axe.violations.map((violation) => ({
                id: violation.id,
                impact: violation.impact ?? 'minor',
                description: violation.description,
                nodes: violation.nodes.length,
              }));
              for (const violation of result.axeViolations) {
                allIssues.push({
                  type: 'axe',
                  impact: violation.impact,
                  browser: browserTarget.name,
                  viewport: viewport.name,
                  routeId: route.id,
                  path: route.path,
                  detail: `${violation.id} (${violation.nodes} nodes)`,
                });
              }

              if (result.pageErrors.length > 0) {
                for (const err of result.pageErrors) {
                  allIssues.push({
                    type: 'runtime-error',
                    browser: browserTarget.name,
                    viewport: viewport.name,
                    routeId: route.id,
                    path: route.path,
                    detail: err,
                  });
                }
              }
              if (result.networkErrors.length > 0) {
                for (const netErr of result.networkErrors.slice(0, 10)) {
                  allIssues.push({
                    type: 'network-error',
                    browser: browserTarget.name,
                    viewport: viewport.name,
                    routeId: route.id,
                    path: route.path,
                    detail: `${netErr.status} ${netErr.url}`,
                  });
                }
              }

              const screenshotName = `${browserTarget.name}__${viewport.name}__${route.id}.png`;
              await page.screenshot({
                path: path.join(screenshotsDir, screenshotName),
                fullPage: true,
              });

              allResults.push(result);
              await page.close();
            }
          } finally {
            await context.close();
          }
        }
      } finally {
        await browser.close();
      }
    }

    const dedupedIssues = [];
    const seen = new Set();
    for (const issue of allIssues) {
      const key = `${issue.type}|${issue.impact ?? ''}|${issue.browser}|${issue.viewport}|${issue.path}|${issue.detail}`;
      if (!seen.has(key)) {
        seen.add(key);
        dedupedIssues.push(issue);
      }
    }

    const withSeverity = dedupedIssues.map((issue) => ({
      ...issue,
      severity: classifyIssueSeverity(issue),
    }));

    const severityCounts = withSeverity.reduce(
      (acc, issue) => {
        acc[issue.severity] += 1;
        return acc;
      },
      { P0: 0, P1: 0, P2: 0, P3: 0 },
    );

    const summary = {
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      browserTargets: browserTargets.map((b) => b.name),
      viewports,
      routeCount: fixtures.routes.length,
      hasVideoShareRoute: hasVideoShare,
      environment: {
        webOrigin: WEB_ORIGIN,
        apiOrigin: API_ORIGIN,
        projectId: fixtures.projectId,
        videoId: fixtures.videoId,
        shareSlideToken: fixtures.shareSlideToken,
        shareVideoToken: fixtures.shareVideoToken,
      },
      results: allResults,
      issues: withSeverity,
      severityCounts,
    };

    auditSummary = summary;

    fs.writeFileSync(path.join(rawDir, 'summary.json'), JSON.stringify(summary, null, 2));

    const issueLines = withSeverity.map(
      (issue, index) =>
        `${index + 1}. [${issue.severity}] ${issue.type} | ${issue.browser} | ${issue.viewport} | \`${issue.path}\` | ${issue.detail}`,
    );

    const markdown = [
      '# Mobile/Tablet UI-UX-A11y Audit Report',
      '',
      `- Generated At: ${new Date().toISOString()}`,
      `- Web Origin: ${WEB_ORIGIN}`,
      `- API Origin: ${API_ORIGIN}`,
      `- Project ID: ${fixtures.projectId}`,
      `- Video ID: ${fixtures.videoId ?? 'N/A'}`,
      `- Slide Share Token: ${fixtures.shareSlideToken}`,
      `- Video Share Token: ${fixtures.shareVideoToken ?? 'N/A (ready video unavailable)'}`,
      `- Browser Targets: ${browserTargets.map((b) => b.name).join(', ')}`,
      `- Viewports: ${viewports.map((v) => `${v.name}(${v.width}x${v.height})`).join(', ')}`,
      '',
      '## Severity Summary',
      '',
      `- P0: ${severityCounts.P0}`,
      `- P1: ${severityCounts.P1}`,
      `- P2: ${severityCounts.P2}`,
      `- P3: ${severityCounts.P3}`,
      '',
      '## Findings',
      '',
      ...(issueLines.length > 0 ? issueLines : ['- No findings detected.']),
      '',
      '## Artifacts',
      '',
      `- Screenshots: \`${path.relative(repoRoot, screenshotsDir)}\``,
      `- Raw JSON: \`${path.relative(repoRoot, path.join(rawDir, 'summary.json'))}\``,
    ].join('\n');

    const reportsDir = path.resolve(repoRoot, 'docs', 'reports');
    ensureDir(reportsDir);
    const latestPath = path.join(reportsDir, 'mobile-tablet-audit-latest.md');
    const stampedPath = path.join(reportsDir, `mobile-tablet-audit-${stamp}.md`);
    fs.writeFileSync(stampedPath, markdown);
    fs.writeFileSync(latestPath, markdown);
    console.log(`Audit report saved: ${stampedPath}`);
    console.log(`Latest report saved: ${latestPath}`);
    console.log(`Artifacts saved: ${rootArtifactsDir}`);
  } finally {
    if (devServer && !devServer.killed) {
      devServer.kill('SIGTERM');
    }
  }

  if (!auditSummary) {
    process.exitCode = 1;
    return;
  }

  const { P0, P1, P2 } = auditSummary.severityCounts;
  if (P0 + P1 + P2 > 0) {
    process.exitCode = 2;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
