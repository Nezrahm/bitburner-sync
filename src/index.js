import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import {
  cleanUpFilename,
  deleteFileAtBitburner,
  getFilesFromBitburner,
  getGameFileGlobs,
  uploadFileToBitburner
} from './client.js';
import {
  deleteLocalFile,
  getAllLocalGameFilesFromDirectory,
  ignoredDirectories,
  isDir,
  saveLocalFile
} from './files.js';
import { log } from './log.js';

/**
 * Get files from bitburner
 * @param {SyncConfig} config
 * @param {boolean} dryRun If set then will all files be listed instead of synced
 */
export const get = async (config, dryRun) => {
  assertConfig(config);

  const files = await getFilesFromBitburner(config.bitburner);
  log.info(`Got ${files.length} from bitburner`);

  for (const file of files) {
    log.fileInfo(file.filename, `RAM usage: ${file.ramUsage}GB`);
    if (!dryRun) saveLocalFile(config.scriptRoot, file.filename, file.code);
  }

  if (!config.allowDelete) return;

  const remoteFilenames = new Set(files.map(f => f.filename));

  const fileMap = getAllLocalGameFilesFromDirectory(config);
  for (const filename of fileMap.keys()) {
    if (remoteFilenames.has(filename)) continue;

    if (dryRun)
      log.fileInfo(filename, 'Would be deleted from disk');
    else
      deleteLocalFile(config.scriptRoot, filename);
  }
};

/**
 * Sync all files once
 * @param {SyncConfig} config
 * @param {boolean} dryRun If set then will all files be listed instead of synced
 */
export const sync = async (config, dryRun) => {
  assertConfig(config);

  const fileMap = getAllLocalGameFilesFromDirectory(config);
  log.info(`Found ${fileMap.size} files to sync`);

  for (const [filename, code] of fileMap.entries()) {
    if (dryRun)
      log.fileInfo(filename, 'Would be uploaded');
    else
      uploadFileToBitburner({
        action: 'UPSERT',
        filename,
        code,
        bitburner: config.bitburner,
      });
  }

  if (!config.allowDelete) return;

  const remoteFiles = await getFilesFromBitburner(config.bitburner);
  for (const file of remoteFiles) {
    if (fileMap.has(cleanUpFilename(file.filename))) continue;

    if (dryRun)
      log.fileInfo(file.filename, 'Would be deleted from bitburner');
    else
      deleteFileAtBitburner({
        filename: file.filename,
        bitburner: config.bitburner,
      });
  }
};

/**
 * Watch sync directory and sync all changes
 * @param {SyncConfig} config
 */
export const watch = config => {
  assertConfig(config);

  const uploadFile = (isAdd, filename) => {
    const fullPath = path.join(config.scriptRoot, filename);
    const contents = fs.readFileSync(fullPath).toString();

    uploadFileToBitburner({
      action: isAdd ? 'CREATE' : 'UPDATE',
      filename,
      code: contents,
      bitburner: config.bitburner,
    });
  };

  const deleteRemoteFile = (filename) => {
    deleteFileAtBitburner({
      filename,
      bitburner: config.bitburner,
    });
  };

  const watcher = chokidar
    .watch(
      getGameFileGlobs(config.bitburner),
      {
        cwd: config.scriptRoot,
        ignored: ignoredDirectories,
      })
    .on('add', path => uploadFile(true, path))
    .on('change', path => uploadFile(false, path));

  if (config.allowDelete)
    watcher.on('unlink', path => deleteRemoteFile(path));

  log.info('Ctrl-C to end watcher');
};

/**
 * Asserts that the config is valid
 * @param {SyncConfig} config
 */
const assertConfig = config => {
  if (typeof config.bitburner.authToken !== 'string')
    throw new Error('AuthToken must be a string');

  if (config.bitburner.authToken.length < 3)
    throw new Error('AuthToken is too short');

  if (!isDir(config.scriptRoot))
    throw new Error(`'${config.scriptRoot}' is not a directory`);
};

