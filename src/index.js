import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { getGameFileGlobs, postFilesToBitburner, postRequestToBitburner } from './client.js';
import { getAllGameFilesFromDirectory, ignoredDirectories, isDir } from './files.js';
import { log } from './log.js';

/***
 * Sync all files once
 * @param {SyncConfig} config
 * @param {Boolean} dryRun If set then will all files be listed instead of synced
 */
export const sync = (config, dryRun) => {
  if (assertConfig(config) !== 0) return;

  const fileMap = getAllGameFilesFromDirectory(config.scriptRoot);
  log.info(`Found ${fileMap.size} files to sync`);

  if (dryRun) {
    for (const file of fileMap.keys())
      log.fileChanged(file);
    return;
  }

  postFilesToBitburner(fileMap, config.authToken);
};

/***
 * Watch sync directory and sync all changes
 * @param {SyncConfig} config
 */
export const watch = config => {
  if (assertConfig(config) !== 0) return;

  /***
   * Send a file to the game client
   * @param {Boolean} isAdd
   * @param {String} filename
   */
  const syncFile = (isAdd, filename) => {
    const fullPath = path.join(config.scriptRoot, filename);
    const contents = fs.readFileSync(fullPath).toString();

    postRequestToBitburner({
      action: isAdd ? 'CREATE' : 'UPDATE',
      filename,
      code: contents,
      authToken: config.authToken,
    });
  };

  chokidar
    .watch(
      getGameFileGlobs(),
      {
        cwd: config.scriptRoot,
        ignored: ignoredDirectories,
      })
    .on('add', path => {
      log.fileAdded(path);
      syncFile(true, path);
    })
    .on('change', path => {
      log.fileChanged(path);
      syncFile(false, path);
    });

  log.info('Ctrl-C to end watcher');
};

/***
 * Asserts that the config is valid
 * @param {SyncConfig} config
 */
const assertConfig = config => {
  if (typeof config.authToken !== 'string') {
    log.error('AuthToken must be a string');
    return -1;
  }

  if (config.authToken.length < 3) {
    log.error('AuthToken is to short');
    return -1;
  }

  if (!isDir(config.scriptRoot)) {
    log.error(`'${config.scriptRoot}' is not a directory`);
    return -1;
  }

  return 0;
};

