import convict from 'convict';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const configFileName = './bitburner-sync.json';

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
    allowDelete: {
      doc: 'If the sync should be allowed to delete files from bitburner',
      format: 'Boolean',
      default: false,
      env: 'npm_package_config_bitburnerAllowDelete',
    },
  });

  const configPath = path.join(process.cwd(), configFileName);
  if (fs.existsSync(configPath)) {
    try {
      config.loadFile(configPath);
    } catch (e) {
      throw new Error(`${configPath} - ${e.message}`);
    }
  }

  return config.validate({ allowed: 'strict' });
};

/**
 * The combined config and arguments
 * @returns {ConfigResult}
 */
export const getArgs = () => {
  const config = getConfig();

  const args = yargs(hideBin(process.argv))
    .strict()
    .option('scriptRoot', {
      describe: 'The local directory to sync with',
      type: 'string',
      default: config.get('scriptRoot'),
    })
    .option('authToken', {
      describe: 'API authorization token',
      type: 'string',
      default: config.get('authToken'),
    })
    .option('allowDelete', {
      describe: 'If the sync should be allowed to delete files',
      type: 'boolean',
      default: config.get('allowDelete'),
    })
    .option('watch', {
      describe: 'To continuously watch the script root for changes',
      type: 'boolean',
    })
    .option('get', {
      describe: 'To get all files from the home server and save them in the script root',
      type: 'boolean',
    })
    .option('dryRun', {
      describe: 'To list the files that would be synced. NB: Cannot be used with watch',
      type: 'boolean',
    })
    .argv;

  const isDryRun = !!args.dryRun;
  const allowDelete = !!args.allowDelete;
  const doWatch = !!args.watch;
  const doGet = !!args.get;

  if (isDryRun && doWatch) throw new Error('Cannot specify both dryRun and watch');

  if (doGet && doWatch) throw new Error('Cannot specify both get and watch');

  return {
    config: {
      scriptRoot: path.resolve(process.cwd(), args.scriptRoot),
      authToken: args.authToken,
      allowDelete,
    },
    doWatch,
    doGet,
    isDryRun,
  };
};
