#!/usr/bin/env node

import convict from 'convict';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sync, watch } from '../src/index.js';
import { log } from '../src/log.js';

const getConfig = () => {
  const config = convict({
    authToken: {
      doc: 'The authorization token',
      format: 'String',
      default: '',
      env: 'npm_package_config_bitburnerAuthToken',
    },
    scriptRoot: {
      doc: 'The root directory where the scripts are',
      format: 'String',
      default: '',
      env: 'npm_package_config_bitburnerScriptRoot',
    },
  });

  const configPath = path.join(process.cwd(), './bitburner-sync.json');
  if (fs.existsSync(configPath)) {
    try {
      config.loadFile(configPath);
    } catch (e) {
      throw new Error(`${configPath} - ${e.message}`);
    }
  }

  return config.validate({ allowed: 'strict' });
};

const getArgs = () => {
  const config = getConfig();

  const args = yargs(hideBin(process.argv))
    .strict()
    .default('scriptRoot', config.get('scriptRoot'))
    .default('authToken', config.get('authToken'))
    .option('watch', {
      describe: 'To continuously watch the script root for changes',
      type: 'boolean',
    })
    .option('dryRun', {
      describe: 'To list the files that would be synced. NB: Cannot be used with watch',
      type: 'boolean',
    })
    .argv;

  const isDryRun = !!args.dryRun;
  const doWatch = !!args.watch;
  const opts = {
    scriptRoot: path.resolve(process.cwd(), args.scriptRoot),
    authToken: args.authToken,
  };

  if (isDryRun && doWatch) throw new Error('Cannot specify both dryRun and watch');

  return {
    opts,
    doWatch,
    isDryRun,
  };
};

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
  log.error(e.message);
}
