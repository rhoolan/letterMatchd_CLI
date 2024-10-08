const fs = require("fs").promises;

// Map class for the cache
class CacheWithExpiry {
  constructor() {
    this.cache = new Map();
  }

  // Set Key, Value, and expiry date for the current time + 1 year
  set(key, value, expiryDate = Date.now() + 31536000000) {
    // This if statement prevents an entry that does not have a key.
    // It solves the problem of reading in a blank file and making a ( null : undefined : time) entry
    if (!key) {
      return;
    }
    this.cache.set(key, { value, expiryDate });
  }

  // Get data from the cache based on the key (key = film-slug)
  get(key) {
    const now = Date.now();
    const cachedItem = this.cache.get(key);

    if (!cachedItem) {
      return null;
    }

    // Check if the cached item is expired. If expired delete.
    if (cachedItem.expiryDate < now) {
      this.cache.delete(key);
      return null;
    }

    return cachedItem.value;
  }

  printCache() {
    console.log("Cache contents:");
    this.cache.forEach((value, key) => {
      console.log(
        `Key: ${key}, Value: ${value.value}, Expiry Date: ${new Date(value.expiryDate).toLocaleString()}`,
      );
    });
  }
}

// Function to read the cache file and populate the cache object
async function readInCacheFromFile(filePath, cache) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const lines = data.split("\n");

    lines.forEach((line) => {
      const info = line.split(" : ");
      const filmName = info[0];
      const posterURL = info[1];
      const expiryDate = info[2];

      cache.set(filmName, posterURL, expiryDate);
    });

    return cache; // Return the cache here
  } catch (error) {
    console.log("Could not read file:", error);
    throw error;
  }
}

// Function to write the cache to the txt file
// CURRENT STATE JUST WRITES BLANK FILE
async function writeCacheToFile(filePath, cache, cacheName) {
  try {
    // Get the Map object from the CacheWithExpiry instance
    const cacheMap = cache.cache;
    // Get size of cache for tracking if an item is the last or not
    const size = cacheMap.size;

    // Prepare the data to write
    const data = Array.from(cacheMap.entries())
      .map(([key, { value, expiryDate }], index) => {
        // Check if it's the last item, omit the line break
        return `${key} : ${value} : ${expiryDate}${index !== size - 1 ? "\n" : ""}`;
      })
      .join("");

    // console.log(data);
    // Write all data at once
    await fs.writeFile(filePath, data, "utf8"); // Specify encoding
    console.log(`\n${cacheName} data written to cache`);
  } catch (error) {
    console.error("Failed to write data to cache:", error);
  }
}

// Function to read the cache file and populate the cache object with user-user scores
// {user-user : score}
async function readInScoresFromFile(filePath, scoreCache) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const lines = data.split("\n");

    lines.forEach((line) => {
      const info = line.split(" : ");
      const userNames = info[0];
      const score = parseFloat(info[1]);

      scoreCache.set(userNames, score);
    });

    return scoreCache; // Return the cache here
  } catch (error) {
    console.log("Could not read file:", error);
    throw error;
  }
}

// Function to write the cache to the txt file
// CURRENT STATE JUST WRITES BLANK FILE
async function writeScoresToFile(filePath, cache, cacheName) {
  try {
    // Get size of cache for tracking if an item is the last or not
    const size = cache.size;

    // Prepare the data to write
    const data = Array.from(cache.entries())
      .map(([key, value], index) => {
        // Check if it's the last item, omit the line break
        return `${key} : ${value}${index !== size - 1 ? "\n" : ""}`;
      })
      .join("");

    // Write all data at once
    await fs.writeFile(filePath, data, "utf8"); // Specify encoding
    console.log(`\n${cacheName} data written to cache`);
  } catch (error) {
    console.error("Failed to write data to cache:", error);
  }
}

// Export the readCacheFile function
module.exports = {
  readInCacheFromFile,
  writeCacheToFile,
  CacheWithExpiry,
  readInScoresFromFile,
  writeScoresToFile,
};
