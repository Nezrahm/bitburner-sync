import convict from 'convict';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createRequire } from 'module';

const configFileName = './bitburner-sync.json';

/**
 * @return {BitburnerConfig}
 */
const getDefaultBitburnerConfig = () => ({
  port: 9990,
  schema: 'http',
  url: '127.0.0.1',
  fileURI: '/',
  validFileExtensions: [
    '.js',
    '.script',
    '.ns',
  ],
  authToken: null,
});

const getConfig = () => {
  const bitburner = getDefaultBitburnerConfig();

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
    serverUrl: {
      doc: 'Connect to this Url',
      format: 'String',
      default: bitburner.url,
      env: 'npm_package_config_bitburnerServerUrl',
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
 * @typedef GetParametersMixedWithConfig
 * @type {object}
 * @property {boolean} dryRun
 * @property {boolean} allowDelete
 * @property {boolean} watch
 * @property {boolean} get
 * @property {string} authToken
 * @property {string} scriptRoot
 * @property {string} serverUrl
 */

/**
 * @returns {GetParametersMixedWithConfig}
 */
const getParametersMixedWithConfig = () => {
  const config = getConfig();

  const require = createRequire(import.meta.url);
  const currentVersion = require('../package.json').version;

  // noinspection JSValidateTypes
  return yargs(hideBin(process.argv))
    .strict()
    .version(`bitburner-sync @ ${currentVersion}`)
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
    .option('serverUrl', {
      describe: 'Server to connect to',
      type: 'string',
      default: config.get('serverUrl'),
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
};

/**
 * The combined config and arguments
 * @returns {ConfigResult}
 */
export const getArgs = () => {
  const args = getParametersMixedWithConfig();

  const isDryRun = !!args.dryRun;
  const allowDelete = !!args.allowDelete;
  const doWatch = !!args.watch;
  const doGet = !!args.get;

  if (isDryRun && doWatch) throw new Error('Cannot specify both dryRun and watch');

  if (doGet && doWatch) throw new Error('Cannot specify both get and watch');

  return {
    config: {
      bitburner: {
        ...getDefaultBitburnerConfig(),
        authToken: args.authToken,
        url: args.serverUrl,
      },
      scriptRoot: path.resolve(process.cwd(), args.scriptRoot),
      allowDelete,
    },
    doWatch,
    doGet,
    isDryRun,
  };
};
