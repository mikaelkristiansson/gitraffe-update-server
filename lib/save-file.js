const fetch = require("node-fetch-commonjs");
const fs = require("fs");
const { join } = require("path");

const saveFile = async (url, path, fileName, token) => {
  const filePath = join(path, fileName);
  // Check if the directory exists
  if (!fs.existsSync(path)) {
    // If it doesn't exist, create the directory
    fs.mkdirSync(path);
  }
  if (fs.existsSync(filePath)) {
    return Promise.resolve(filePath);
  }
  const lastFileEnding = fileName.substring(fileName.lastIndexOf("_") + 1);
  // remove previous file
  const oldFile = fs
    .readdirSync(path)
    .filter((allFilesPaths) => allFilesPaths.match(lastFileEnding) !== null);
  if (oldFile.length > 0) {
    fs.unlinkSync(join(path, oldFile[0]));
  }
  const res = await fetch(url, {
    headers: {
      Accept: "application/octet-stream",
      Authorization:
        token && typeof token === "string" && token.length > 0
          ? `Bearer ${token}`
          : undefined,
    },
  });
  const fileStream = fs.createWriteStream(filePath);
  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", () => resolve(filePath));
  });
};

module.exports = saveFile;
