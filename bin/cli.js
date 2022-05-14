#!/usr/bin/env node

import { getArgs } from '../src/config.js';
import { get, sync, watch } from '../src/index.js';
import { log } from '../src/log.js';

const main = async () => {
  const { doWatch, doGet, isDryRun, config } = getArgs();

  if (doWatch)
    watch(config);
  else if (doGet)
    await get(config, isDryRun);
  else
    await sync(config, isDryRun);
};

const handleError = e => {
  const msg = e && e.message ? e.message : e;

  if (msg === undefined) return;

  log.error(msg);
};

process.on('uncaughtException', error => handleError(error));

try {
  await main();
} catch (error) {
  handleError(error);
}
