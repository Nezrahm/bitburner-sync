#!/usr/bin/env node

import { getArgs } from '../src/config.js';
import { sync, watch } from '../src/index.js';
import { log } from '../src/log.js';

const main = () => {
  const { doWatch, isDryRun, opts } = getArgs();

  if (doWatch)
    watch(opts);
  else
    sync(opts, isDryRun);
};

try {
  main();
} catch (e) {
  const msg = e && e.message ? e.message : e;
  log.error(msg);
}
