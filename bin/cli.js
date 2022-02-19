#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sync, watch } from '../src/index.js';

const args = yargs(hideBin(process.argv))
  .default('scriptRoot', process.env.npm_package_config_bitburnerScriptRoot || '')
  .default('authToken', process.env.npm_package_config_bitburnerAuthToken || '')
  .option('watch', {
    describe: 'To continuously watch the script root for changes',
    type: 'boolean',
  })
  .option('dryRun', {
    describe: 'To list the files that would be synced. NB: Cannot be used with watch',
    type: 'boolean',
  })
  .help()
  .strict()
  .argv;

const isDryRun = !!args.dryRun;
const doWatch = !!args.watch;
const pwd = path.resolve(process.env.PWD, args.scriptRoot);
const opts = {
  scriptRoot: pwd,
  authToken: args.authToken,
};

if (doWatch)
  watch(opts);
else
  sync(opts, isDryRun);
