#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflowPaths = process.argv.slice(2);

if (workflowPaths.length === 0) {
  workflowPaths.push('workflows/Personal Assistant.json');
}

const secretPatterns = [
  {
    label: 'credential in a URL query string',
    pattern:
      /[?&](?:api[_-]?key|access[_-]?token|auth(?:orization)?|token|secret|password)=([^&\s"'{}]{8,})/i,
  },
  {
    label: 'bearer token',
    pattern: /\bbearer\s+[a-z0-9._~-]{16,}/i,
  },
  {
    label: 'provider token',
    pattern:
      /(?:sk-(?:proj-)?[a-z0-9_-]{16,}|github_pat_[a-z0-9_]{16,}|gh[oprsu]_[a-z0-9]{16,}|xox[baprs]-[a-z0-9-]{16,}|AIza[a-z0-9_-]{30,})/i,
  },
];

let failureCount = 0;

for (const workflowPath of workflowPaths) {
  const absolutePath = resolve(workflowPath);
  const errors = [];
  let workflow;

  try {
    workflow = JSON.parse(readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    console.error(`${workflowPath}: invalid JSON (${error.message})`);
    failureCount += 1;
    continue;
  }

  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) {
    errors.push('$: workflow must be a JSON object');
  }

  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];

  if (nodes.length === 0) {
    errors.push('$.nodes: workflow must contain at least one node');
  }

  const nodeNames = new Set();
  const nodeIds = new Set();

  for (const [index, node] of nodes.entries()) {
    const path = `$.nodes[${index}]`;

    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      errors.push(`${path}: node must be an object`);
      continue;
    }

    if (typeof node.name !== 'string' || node.name.trim() === '') {
      errors.push(`${path}.name: node name must be a non-empty string`);
    } else if (nodeNames.has(node.name)) {
      errors.push(`${path}.name: duplicate node name ${JSON.stringify(node.name)}`);
    } else {
      nodeNames.add(node.name);
    }

    if (typeof node.id !== 'string' || node.id.trim() === '') {
      errors.push(`${path}.id: node ID must be a non-empty string`);
    } else if (nodeIds.has(node.id)) {
      errors.push(`${path}.id: duplicate node ID ${JSON.stringify(node.id)}`);
    } else {
      nodeIds.add(node.id);
    }

    if (typeof node.type !== 'string' || node.type.trim() === '') {
      errors.push(`${path}.type: node type must be a non-empty string`);
    }
  }

  const connections = workflow.connections;

  if (!connections || typeof connections !== 'object' || Array.isArray(connections)) {
    errors.push('$.connections: connections must be an object');
  } else {
    for (const [sourceName, channels] of Object.entries(connections)) {
      if (!nodeNames.has(sourceName)) {
        errors.push(`$.connections.${sourceName}: source node does not exist`);
      }

      if (!channels || typeof channels !== 'object' || Array.isArray(channels)) {
        errors.push(`$.connections.${sourceName}: connection channels must be an object`);
        continue;
      }

      for (const [channelName, groups] of Object.entries(channels)) {
        if (!Array.isArray(groups)) {
          errors.push(
            `$.connections.${sourceName}.${channelName}: connection groups must be an array`,
          );
          continue;
        }

        for (const [groupIndex, group] of groups.entries()) {
          if (group === null) {
            continue;
          }

          if (!Array.isArray(group)) {
            errors.push(
              `$.connections.${sourceName}.${channelName}[${groupIndex}]: connection group must be an array`,
            );
            continue;
          }

          for (const [linkIndex, link] of group.entries()) {
            const linkPath = `$.connections.${sourceName}.${channelName}[${groupIndex}][${linkIndex}]`;

            if (!link || typeof link !== 'object' || Array.isArray(link)) {
              errors.push(`${linkPath}: connection must be an object`);
              continue;
            }

            if (!nodeNames.has(link.node)) {
              errors.push(`${linkPath}.node: target node ${JSON.stringify(link.node)} does not exist`);
            }

            if (typeof link.type !== 'string' || link.type.trim() === '') {
              errors.push(`${linkPath}.type: connection type must be a non-empty string`);
            }

            if (!Number.isInteger(link.index) || link.index < 0) {
              errors.push(`${linkPath}.index: connection index must be a non-negative integer`);
            }
          }
        }
      }
    }
  }

  visitStrings(workflow, '$', (value, path) => {
    for (const { label, pattern } of secretPatterns) {
      if (pattern.test(value)) {
        errors.push(`${path}: possible hard-coded ${label}`);
      }
    }

    if (
      path.endsWith('.url') &&
      /^=?http:\/\//i.test(value) &&
      !/^=?http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value)
    ) {
      errors.push(`${path}: external request URL must use HTTPS`);
    }
  });

  if (errors.length > 0) {
    console.error(`${workflowPath}: validation failed`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    failureCount += 1;
    continue;
  }

  console.log(
    `${workflowPath}: valid (${nodes.length} nodes, ${Object.keys(connections).length} connection sources)`,
  );
}

process.exitCode = failureCount === 0 ? 0 : 1;

function visitStrings(value, path, visitor) {
  if (typeof value === 'string') {
    visitor(value, path);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => visitStrings(entry, `${path}[${index}]`, visitor));
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    visitStrings(entry, `${path}.${key}`, visitor);
  }
}
