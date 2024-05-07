const fetch = require("node-fetch-commonjs");
const retry = require("async-retry");

module.exports = async (fileName, assets, token) => {
  // Look if we can find a signature...
  const foundSignature = assets.find(
    (asset) => asset.name === `${fileName}.sig`,
  );

  if (!foundSignature) {
    return null;
  }

  const res = await retry(
    async () => {
      const response = await fetch(foundSignature.url, {
        headers: {
          Accept: "application/octet-stream",
          Authorization:
            token && typeof token === "string" && token.length > 0
              ? `Bearer ${token}`
              : undefined,
        },
      });
      if (response.status !== 200) {
        throw new Error(
          `GitHub API responded with ${response.status} for url ${foundSignature.url}`,
        );
      }

      return response;
    },
    { retries: 3 },
  );
  return res.text();
};
