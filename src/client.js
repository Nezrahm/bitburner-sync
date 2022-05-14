import http from 'http';
import { log } from './log.js';

/**
 * @param {BitburnerConfig} config
 * @param {string} fileURI
 * @return {boolean}
 */
export const isValidGameFile = (config, fileURI) => config
  .validFileExtensions
  .some(ext => fileURI.endsWith(ext));

/**
 * @param {BitburnerConfig} config
 * @return {string[]}
 */
export const getGameFileGlobs = (config) => config
  .validFileExtensions
  .map(ext => `**/*${ext}`);

/**
 * Make a POST request to the expected port of the game
 * @param {UploadPayload} payload The payload to send to the game client
 */
export const uploadFileToBitburner = payload => {
  const file = prepareUploadFile(payload);

  sendRequestToBitburner(
    'POST',
    file.blob,
    payload.bitburner,
    (res, body) => {
      switch (res.statusCode) {
        case 200:
          logMessage(false, file.filename, 'Uploaded', body);
          break;
        case 401:
          logMessage(true, file.filename, 'Unauthorized', body);
          break;
        default:
          logMessage(true, file.filename, 'Failed to push', body);
          break;
      }
    });
};

/**
 * Get all files from home
 * @param {BitburnerConfig} config
 * @returns {Promise<BitburnerFiles[]>}
 */
export const getFilesFromBitburner = (config) => {
  const deferred = getDeferred();

  sendRequestToBitburner(
    'GET',
    '{}',
    config,
    (res, body) => {
      if (body === 'not a script file') {
        logMessage(true, undefined, 'The bitburner client is too old for retrieval', undefined);
        deferred.reject();
        return;
      }

      switch (res.statusCode) {
        case 200: {
          let json;

          try {
            json = JSON.parse(body);
          } catch {
            logMessage(true, undefined, 'Failed to parse files', body);
            break;
          }

          if (json.success) {
            deferred.resolve(json.data.files);
            return;
          }

          logMessage(true, undefined, 'Failed while retrieving files', body);
          break;
        }
        default:
          logMessage(true, undefined, 'Failed to retrieve files', body);
          break;
      }

      deferred.reject();
    });

  return deferred.promise;
};

/**
 * Delete a file at bitburner
 * @param {DeletePayload} payload
 */
export const deleteFileAtBitburner = payload => {
  const file = prepareDeleteFile(payload);

  sendRequestToBitburner(
    'DELETE',
    file.blob,
    payload.bitburner,
    (res, body) => {
      switch (res.statusCode) {
        case 200:
          logMessage(false, file.filename, 'Deleted', body);
          break;
        default:
          logMessage(true, file.filename, 'Failed to delete', body);
          break;
      }
    });
};

/**
 * Log a message, parsing the body for additional information.
 * @param {boolean} isError
 * @param {string?} filename
 * @param {string} message
 * @param {string} body
 */
const logMessage = (isError, filename, message, body) => {
  let json;

  try {
    json = JSON.parse(body);
  } catch {
    // NOOP
  }

  if (json === undefined) {
    if (body && body !== 'written')
      message += ` - ${body}`;
  } else {
    isError = json.success === undefined ? isError : !json.success;

    if (json.msg !== undefined)
      message += ` - ${json.msg}`;

    if (json.data !== undefined) {
      if (json.data.overwritten)
        message += ', overwritten';

      if (json.data.ramUsage !== undefined)
        message += `, RAM usage: ${json.data.ramUsage}GB`;
    }
  }

  if (filename) {
    if (isError) log.fileError(filename, message);
    else log.fileInfo(filename, message);
  } else {
    if (isError) log.error(message);
    else log.info(message);
  }
};

/**
 * Used to handle responses
 * @callback sendRequestToBitburner-callback
 * @param {IncomingMessage} res The response object
 * @param {string} body The response body
 */

/**
 * Craft a http request and send it
 * @param {'POST' | 'GET' | 'DELETE' } method
 * @param {string} blob
 * @param {BitburnerConfig} config
 * @param {sendRequestToBitburner-callback} responseHandler
 */
const sendRequestToBitburner = (method, blob, config, responseHandler) => {
  const options = {
    hostname: config.url,
    port: config.port,
    path: config.fileURI,
    method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': blob.length,
      Authorization: `Bearer ${config.authToken}`,
    },
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk.toString());
    res.on('end', () => responseHandler(res, body));
  });

  req.on('error', error => log.error('Network exception - ' + error));
  req.write(blob);
  req.end();
};

/**
 * Get prepared data for the request
 * @param {UploadPayload} payload
 * @returns {{filename: string, blob: string}}
 */
const prepareUploadFile = payload => {
  const filename = cleanUpFilename(payload.filename);
  const code = Buffer.from(payload.code).toString('base64');

  return {
    filename,
    blob: JSON.stringify({ filename, code }),
  };
};

/**
 *
 * @param {DeletePayload} payload
 * @returns {{filename: string, blob: string}}
 */
const prepareDeleteFile = payload => {
  const filename = cleanUpFilename(payload.filename);

  return {
    filename,
    blob: JSON.stringify({ filename }),
  };
};

/**
 *
 * @param {string} filename
 * @returns {string}
 */
export const cleanUpFilename = (filename) => {
  // If the file is going to be in a directory, it NEEDS the leading `/`, i.e. `/my-dir/file.js`
  // If the file is standalone, it CAN NOT HAVE a leading slash, i.e. `file.js`
  // The game will not accept the file and/or have undefined behaviour otherwise...

  filename = `${filename}`.replace(/[\\|/]+/g, '/');

  const haveFolder = /^.+\//.test(filename);
  const hasInitialSlash = filename.startsWith('/');

  if (haveFolder && !hasInitialSlash)
    filename = `/${filename}`;
  else if (!haveFolder && hasInitialSlash)
    filename = filename.substring(1);

  return filename;
};

const getDeferred = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};
