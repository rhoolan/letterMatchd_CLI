const fs = require("fs").promises;

// Function to read the cache file and populate the cache object
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

    return cache; // Return the cache here
  } catch (error) {
    console.log("Could not read file:", error);
    throw error;
  }
}

// Export the readCacheFile function
module.exports = {
  readCacheFile,
};
