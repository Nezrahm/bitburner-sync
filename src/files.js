import fs from 'fs';
import path from 'path';
import { cleanUpFilename, isValidGameFile } from './client.js';

/**
 * Check provided path to see if it resolves to a directory or not
 * @param {fs.PathLike} pathURI The path to check
 * @returns {boolean} Whether the path is a director or not
 */
export const isDir = pathURI => {
  const stats = fs.statSync(pathURI, { throwIfNoEntry: false });
  return stats !== undefined && stats.isDirectory();
};

export const ignoredDirectories = [
  'node_modules',
];

/**
 * Check provided path to see if it resolves to a file or not
 * @param {fs.PathLike} pathURI The path to check
 * @returns {boolean} Whether the path is a file or not
 */
const isFile = pathURI => fs.statSync(pathURI).isFile();

/**
 * Gets all the directory URIs for a given path
 * @param {fs.PathLike} pathURI The path we want to extract directories from
 * @returns {Array<fs.PathLike>} An array of directory paths
 */
const getDirs = pathURI => fs
  .readdirSync(pathURI)
  .filter(name => !ignoredDirectories.includes(name))
  .map(name => path.join(pathURI.toString(), name))
  .filter(isDir);

/**
 * Gets all the file URIs for a given path
 * @param {fs.PathLike} pathURI The path we want to extract files from
 * @returns {Array<fs.PathLike>} An array of file paths
 */
const getFiles = pathURI => fs
  .readdirSync(pathURI)
  .map(name => path.join(pathURI.toString(), name))
  .filter(isFile);

/**
 * Recursively extract all the absolute file URIs for a given root directory
 * @param {fs.PathLike} pathURI The root of the path we want to recursively extract all the file URIs from
 * @returns {Array<fs.PathLike>} An array of fully qualified/absolute file URIs for the given root directory
 * and subdirectories
 */
const getFilesRecursively = pathURI => {
  const dirs = getDirs(pathURI.toString());
  const files = dirs.flatMap(dir => getFilesRecursively(dir));
  return [...files, ...getFiles(pathURI)];
};

/**
 * Retrieve all local files
 * @param {string} scriptRoot
 * @returns {Map<string, string>} A map with local filenames and content
 */
export const getAllLocalGameFilesFromDirectory = scriptRoot => {
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

/**
 * Save a local file
 * @param {string} scriptRoot
 * @param {string} filename
 * @param {string} code
 */
export const saveLocalFile = (scriptRoot, filename, code) => {
  const fileURI = path.join(scriptRoot, filename);
  const pathURI = path.dirname(fileURI);
  fs.mkdirSync(pathURI, { recursive: true });
  fs.writeFileSync(fileURI, code);
};

/**
 * Delete a local file
 * @param {string} scriptRoot
 * @param {string} filename
 */
export const deleteLocalFile = (scriptRoot, filename) => {
  const fileURI = path.join(scriptRoot, filename);
  fs.rmSync(fileURI);
};

const normalizeFileName = (filename, scriptRoot) =>
  cleanUpFilename(filename.substring(scriptRoot.length));
