import fs from 'fs';
import { join } from 'path';
import { isValidGameFile } from './client.js';

/**
 * Check provided path to see if it resolves to a directory or not
 * @param {fs.PathLike} path The path to check
 * @returns {boolean} Whether the path is a director or not
 */
export const isDir = path => {
  const stats = fs.statSync(path, { throwIfNoEntry: false });
  return stats !== undefined && stats.isDirectory();
};

export const ignoredDirectories = [
  'node_modules',
];

/**
 * Check provided path to see if it resolves to a file or not
 * @param {fs.PathLike} path The path to check
 * @returns {boolean} Whether the path is a file or not
 */
const isFile = path => fs.statSync(path).isFile();

/**
 * Gets all the directory URIs for a given path
 * @param {fs.PathLike} path The path we want to extract directories from
 * @returns {Array<fs.PathLike>} An array of directory paths
 */
const getDirs = path => fs
  .readdirSync(path)
  .filter(name => !ignoredDirectories.includes(name))
  .map(name => join(path.toString(), name))
  .filter(isDir);

/**
 * Gets all the file URIs for a given path
 * @param {fs.PathLike} path The path we want to extract files from
 * @returns {Array<fs.PathLike>} An array of file paths
 */
const getFiles = path => fs
  .readdirSync(path)
  .map(name => join(path.toString(), name))
  .filter(isFile);

/**
 * Recursively extract all the absolute file URIs for a given root directory
 * @param {fs.PathLike} path The root of the path we want to recursively extract all the file URIs from
 * @returns {Array<fs.PathLike>} An array of fully qualified/absolute file URIs for the given root directory
 * and subdirectories
 */
const getFilesRecursively = path => {
  const dirs = getDirs(path.toString());
  const files = dirs.flatMap(dir => getFilesRecursively(dir));
  return [...files, ...getFiles(path)];
};

/***
 *
 * @param scriptRoot
 * @returns {Map<String, String>} A map with local filenames and content
 */
export const getAllGameFilesFromDirectory = scriptRoot => {
  const filesURIs = getFilesRecursively(scriptRoot)
    .filter(isValidGameFile);

  return filesURIs
    .reduce(
      (fileMap, fileURI) => {
        const contents = fs.readFileSync(fileURI).toString();
        const filename = normalizeFileName(fileURI.toString(), scriptRoot);
        return fileMap.set(filename, contents);
      },
      new Map());
};

export const normalizeFileName = (filename, scriptRoot) =>
  filename.substring(scriptRoot.length);
