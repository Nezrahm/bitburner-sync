import http from 'http';
import { log } from './log.js';

const bitburnerConfig = {
  port: 9990,
  schema: 'http',
  url: 'localhost',
  filePostURI: '/',
  validFileExtensions: [
    '.js',
    '.script',
    '.ns',
    '.txt',
  ],
};

export const isValidGameFile = fileURI => bitburnerConfig
  .validFileExtensions
  .some(ext => fileURI.endsWith(ext));

export const getGameFileGlobs = () => bitburnerConfig
  .validFileExtensions
  .map(ext => `**/*${ext}`);

/***
 * Upload all files
 * @param {Map<String, String>} fileToContentMap
 * @param {String} authToken
 */
export const postFilesToBitburner = (fileToContentMap, authToken) => {
  for (const [filename, code] of fileToContentMap.entries()) {
    postRequestToBitburner({
      action: 'UPSERT',
      filename,
      code,
      authToken,
    });
  }
};

/**
 * Make a POST request to the expected port of the game
 * @param {UploadPayload} payload The payload to send to the game client
 */
export const postRequestToBitburner = payload => {
  const file = prepareFile(payload);

  const options = {
    hostname: bitburnerConfig.url,
    port: bitburnerConfig.port,
    path: bitburnerConfig.filePostURI,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': file.blob.length,
      Authorization: `Bearer ${payload.authToken}`,
    },
  };

  const req = http.request(options, res => {
    res.on('data', chunk => {
      const responseBody = Buffer.from(chunk).toString();
      switch (res.statusCode) {
        case 200:
          // log.info(`${file.filename} has been uploaded!`);
          break;
        case 401:
          log.error(`Failed to push ${file.filename} to the game!\n${responseBody}`);
          break;
        default:
          log.error(`File failed to push, statusCode: ${res.statusCode} | message: ${responseBody}`);
          break;
      }
    });
  });

  req.write(file.blob);
  req.end();
};

const prepareFile = payload => {
  // If the file is going to be in a directory, it NEEDS the leading `/`, i.e. `/my-dir/file.js`
  // If the file is standalone, it CAN NOT HAVE a leading slash, i.e. `file.js`
  // The game will not accept the file and/or have undefined behaviour otherwise...

  let filename = `${payload.filename}`.replace(/[\\|/]+/g, '/');

  const haveFolder = /^[^/].+\//.test(filename);
  const hasInitialSlash = filename.startsWith('/');

  if (haveFolder && !hasInitialSlash)
    filename = `/${filename}`;
  else if (!haveFolder && hasInitialSlash)
    filename = filename.substring(1);

  const code = Buffer.from(payload.code).toString('base64');

  return {
    filename,
    blob: JSON.stringify({ filename, code }),
  };
};
