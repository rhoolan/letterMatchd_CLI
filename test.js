const fs = require("fs").promises;

// Read cache file using promises
async function readCacheFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const lines = data.split("\n");
    let cache = {};

    lines.forEach((line) => {
      const info = line.split(" : ");
      const filmName = info[0];
      const posterURL = info[1];
      const expiryDate = info[2];

      cache[filmName] = { posterURL, expiryDate };
    });

    return cache; // Return the cache data
  } catch (error) {
    console.error("Could not read file:", error);
    throw error; // Propagate the error if needed
  }
}

module.exports = {
  readCacheFile,
};