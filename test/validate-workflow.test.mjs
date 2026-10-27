import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validatorPath = join(repositoryRoot, 'scripts', 'validate-workflow.mjs');

function workflow(overrides = {}) {
  return {
    name: 'Fixture',
    nodes: [
      {
        id: 'fixture-start',
        name: 'Start',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        parameters: {},
        position: [0, 0],
      },
    ],
    connections: {},
    ...overrides,
  };
}

function validate(fixture) {
  const directory = mkdtempSync(join(tmpdir(), 'personal-assistant-validation-'));
  const fixturePath = join(directory, 'workflow.json');

  try {
    writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);
    return spawnSync(process.execPath, [validatorPath, fixturePath], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('accepts a structurally valid workflow', () => {
  const result = validate(workflow());

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /valid \(1 nodes, 0 connection sources\)/);
});

test('rejects a hard-coded query credential without printing it', () => {
  const secret = 'do-not-print-this-secret-value';
  const fixture = workflow();
  fixture.nodes[0].parameters.url = `https://example.com/search?api_key=${secret}`;

  const result = validate(fixture);
  const output = `${result.stdout}${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /possible hard-coded credential in a URL query string/);
  assert.doesNotMatch(output, new RegExp(secret));
});

test('rejects insecure external request URLs', () => {
  const fixture = workflow();
  fixture.nodes[0].parameters.url = 'http://api.example.com/data';

  const result = validate(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /external request URL must use HTTPS/);
});

test('rejects connections to missing nodes', () => {
  const result = validate(
    workflow({
      connections: {
        Start: {
          main: [
            [
              {
                node: 'Missing',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
      },
    }),
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /target node "Missing" does not exist/);
});
