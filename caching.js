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

// Write the cache to the text file
function writeToCache(filePath, cache) {
  // Get size of cache for tracking if an item is the last or not
  let size = Object.keys(cache).length;
  let position = 0;

  // Delete all contents of file in preperation for re-writing the cache
  fs.truncate(filePath, 0, (err) => {
    if (err) throw err;
    console.log("File has been cleared");
  });

  // Iterate thru all key/value pairs
  Object.keys(cache).forEach((key) => {
    position++; // Increment the position for tracking if last object
    let filmName = key;
    let filmInfo = cache[key];
    let posterURL = filmInfo.posterURL;
    let expiryDate = filmInfo.expiryDate;
    let data = null;
    // Check to see if it is the last item in the object. If if is omit the line break
    // This will stop the file writing strange
    if (position !== size) {
      data = `${filmName} : ${posterURL} : ${expiryDate}\n`;
    } else {
      data = `${filmName} : ${posterURL} : ${expiryDate}`;
    }

    fs.appendFile(filePath, data, (err) => {
      if (err) throw err;
    });
  });
}

// Export the readCacheFile function
module.exports = {
  readCacheFile,
  writeToCache,
};
