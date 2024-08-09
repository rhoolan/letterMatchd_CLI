const cheerio = require("cheerio");
const prompt = require("prompt-sync")();
const { fetchPage, getInfoFromFilmPage } = require("./sharedFunctions.js");
const {
  readInCacheFromFile,
  writeCacheToFile,
  CacheWithExpiry,
} = require("./caching.js");

// Cache file path
const posterURLFilePath = "./posterURLCache.txt";
const averageRatingsFilePath = "./averageRatingCache.txt";

// Get the users watched film page count (Used to limit the number of futures in getLetterBoxdWatchlist)
async function getPageCount(username) {
  try {
    const url = `https://letterboxd.com/${username}/films`;
    const page = await fetchPage(url);
    const $ = cheerio.load(page);

    const lastLi = $(".paginate-pages li.paginate-page:last-child");
    const pageCount = lastLi.text().trim();

    return pageCount;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

// Get the users watchList
async function getLetterboxdWatchlist(username) {
  let watchlist = [];
  let page = 1;
  const pageAmount = await getPageCount(username);
  let futures = [];

  while (true) {
    const url = `https://letterboxd.com/${username}/watchlist/page/${page}`;
    futures.push(fetchPage(url));
    page += 1;
    if (futures.length >= pageAmount) {
      break;
    }
  }

  const pages = await Promise.all(futures);

  for (const content of pages) {
    if (!content) {
      continue;
    }

    const $ = cheerio.load(content);
    const films = $("li.poster-container");

    if (!films.length) {
      break;
    }

    films.each((index, film) => {
      const filmTitle = $(film).find("img.image").attr("alt");
      const filmSlug = $(film).find("div").attr("data-film-slug");
      watchlist.push([filmTitle, filmSlug]);
    });
  }

  console.log(`${username}'s watchlist successfully retrived.\n`);
  return watchlist;
}

// Compare the two users lists
function compareWatchLists(listOne, listTwo) {
  const commonMovies = listOne.filter((subarray1) =>
    listTwo.some(
      (subarray2) => JSON.stringify(subarray1) === JSON.stringify(subarray2),
    ),
  );

  return commonMovies;
}

// Display the output in the console
async function displayOutput(commonMovies, posterCache, ratingCache) {
  posterCache = posterCache;
  ratingCache = ratingCache;

  for (let i = 0; i < commonMovies.length; i++) {
    const filmName = commonMovies[i][0];
    const filmSlug = commonMovies[i][1];

    // Set variables for posterURL and Rating
    let posterURL = null;
    let averageRating = null;

    // Check cache for movie poster
    let posterCacheCheck = posterCache.get(filmSlug);
    // console.log(cacheCheck);
    if (posterCacheCheck) {
      posterURL = posterCacheCheck;
    }

    // Check cache for movie rating
    let averageRatingCacheCheck = ratingCache.get(filmSlug);
    // console.log(cacheCheck);
    if (averageRatingCacheCheck) {
      averageRating = averageRatingCacheCheck;
    }

    // If either posterURL or averageRating are null, set both in the cache
    // Both are scraped from the same request, so its not wasteful to update both at the same time
    if (!posterURL || !averageRating) {
      const filmInfo = await getInfoFromFilmPage(filmSlug);
      posterURL = filmInfo[0];
      averageRating = filmInfo[1];

      // Set cache
      posterCache.set(filmSlug, posterURL);
      ratingCache.set(filmSlug, averageRating);
    }

    console.log(
      `Film name: ${filmName} \nLetterBoxd Average User Rating: ${averageRating}\nPoster: ${posterURL} \n`,
    );
  }
}

// Main function to run program
(async () => {
  // Set new catch that uses expiry date
  let posterCache = new CacheWithExpiry();
  let ratingCache = new CacheWithExpiry();

  // Read in cache from TXT file
  await readInCacheFromFile(posterURLFilePath, posterCache);
  await readInCacheFromFile(averageRatingsFilePath, ratingCache);

  const userOne = prompt("Enter the first user's Letterboxd username: ").trim();
  const userTwo = prompt(
    "Enter the second user's Letterboxd username: ",
  ).trim();

  console.log(`\nGetting ${userOne}'s watchlist...`);
  const watchListOne = await getLetterboxdWatchlist(userOne);
  console.log(`Getting ${userTwo}'s watchlist`);
  const watchListTwo = await getLetterboxdWatchlist(userTwo);

  if (!Array.isArray(watchListOne) || !Array.isArray(watchListTwo)) {
    console.error("One of the watchlists is not an array");
    return;
  }
  console.log("Comparing watchlists...");
  const commonMovies = compareWatchLists(watchListOne, watchListTwo);
  console.log("Creating output...\n");
  await displayOutput(commonMovies, posterCache, ratingCache);

  await writeCacheToFile(posterURLFilePath, posterCache, "Poster URL");
  await writeCacheToFile(
    averageRatingsFilePath,
    ratingCache,
    "Average Ratings",
  );
})();
