const cheerio = require("cheerio");
const prompt = require("prompt-sync")();
const { fetchPage, getInfoFromFilmPage } = require("./sharedFunctions.js");
const {
  readInCacheFromFile,
  writeCacheToFile,
  CacheWithExpiry,
  readInScoresFromFile,
  writeScoresToFile,
} = require("./caching.js");

// pMap for handling huge lists
const pLimit = require("p-limit");

// Cache file path
const posterCacheFilePath = "./posterURLCache.txt";

// Score cache file path
const scoreCacheFilePath = "./scoreCache.txt";

// Get the users watched film page count (Used to limit the number of futures in getLetterBoxdWatchlist). :INTERGRATION TEST NEEDED
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

// Get the users watched film list. :INTERGRATION TEST NEEDED
async function getLetterboxdWatchlist(username) {
  let watchlist = [];
  let page = 1;
  const pageAmount = await getPageCount(username);
  let futures = [];

  while (futures.length <= pageAmount) {
    const url = `https://letterboxd.com/${username}/films/page/${page}`;
    // Get the URL's HTML content and push it into the futures array for later processing
    futures.push(fetchPage(url));
    page += 1;
  }

  // Fetch data from multiple promises in the futures array concurrently
  const pages = await Promise.all(futures);

  // Iterate thru the pages to process the data
  for (const content of pages) {
    // Skip the page if there is no content
    if (!content) {
      continue;
    }

    // Load content and get the HTML for each film on the page
    const $ = cheerio.load(content);
    const films = $("li.poster-container");

    if (!films.length) {
      break;
    }

    // Proccess each film
    films.each((index, film) => {
      const title = $(film).find("img").attr("alt");
      const filmSlug = $(film).find("div").attr("data-film-slug");
      const rating = $(film).find(".rating.-micro.-darker").text().trim();

      // Check that the film has a title, if so process
      if (title) {
        let movie = {};
        movie.title = title;
        movie.rating = rating;
        movie.filmSlug = filmSlug;
        watchlist.push(movie);
      }
    });
  }

  let filmCount = watchlist.length;

  console.log(
    `Retrived ${username}'s watched list.\nThere are ${filmCount} films in the list.\n`,
  );
  return watchlist;
}

// Compare the two users film lists. :UNIT TESTS DONE
function compareWatchedLists(userOneList, userTwoList) {
  // Create a set to store unique shared titles
  const sharedTitlesSet = new Set();

  // Filter userOneList to only films that appear in userTwoList
  userOneList.forEach((element1) => {
    if (userTwoList.some((element2) => element2.title === element1.title)) {
      sharedTitlesSet.add(element1.title);
    }
  });

  const sharedTitles = Array.from(sharedTitlesSet);

  console.log(`You have ${sharedTitles.length} in common.`);
  return sharedTitles;
}

// Create the output. :UNIT TESTS DONE
async function createOutput(sharedTitles, userOneList, userTwoList, cache) {
  // Create a limit function that allows up to 10 concurrent requests
  const limit = pLimit(10);

  const promises = sharedTitles.map((title) =>
    limit(async () => {
      const movieUserOne = userOneList.find((movie) => movie.title === title);
      const movieUserTwo = userTwoList.find((movie) => movie.title === title);

      // Check cache for movie poster
      let posterURL = null;
      let cacheCheck = cache.get(movieUserOne.filmSlug);
      if (cacheCheck) {
        posterURL = cacheCheck;
      } else {
        const filmInfo = await getInfoFromFilmPage(movieUserOne.filmSlug);
        posterURL = filmInfo[0];
        cache.set(movieUserOne.filmSlug, posterURL);
      }

      return {
        title,
        posterURL: posterURL,
        userOneRating: movieUserOne.rating,
        userTwoRating: movieUserTwo.rating,
        cache: cache,
      };
    }),
  );

  return await Promise.all(promises);
}

// Print the output in an easy to read way. :UNIT TESTS DONE
function printOutput(output, userOne, userTwo) {
  console.log("Printing output");
  for (let i = 0; i < output.length; i++) {
    let title = output[i];
    // console.log(title);
    console.log(
      `\nTitle: ${title.title}\nMovie Poster: ${title.posterURL}\n${userOne} rating : ${title.userOneRating}\n${userTwo} rating: ${title.userTwoRating}`,
    );
  }
}

// Calculate the users compatibility using the Pearson correlation coefficient. :UNIT TESTS DONE
function calculateCompatibility(data) {
  // Filter the data to remove any movies where one user has not rated. This prevents the algorithm from processing that user's rating for the movie as a 0.
  const filteredData = data.filter(
    (movie) => movie.userOneRating !== "" && movie.userTwoRating !== "",
  );
  // console.log(filteredData);
  // Extract and convert user ratings from the data
  let userOneRatings = filteredData
    .map((movie) => movie.userOneRating)
    .map((rating) => convertStarRating(rating)); // Convert star rating to a numerical rating
  let userTwoRatings = filteredData
    .map((movie) => movie.userTwoRating)
    .map((rating) => convertStarRating(rating)); // Convert star rating to a numerical rating

  // Calcuate the mean rating for each user
  let userOneMean =
    userOneRatings.reduce((a, b) => a + b, 0) / userOneRatings.length;
  let userTwoMean =
    userTwoRatings.reduce((a, b) => a + b, 0) / userTwoRatings.length;

  // Calculate the numerator for the Pearson correlation coefficient
  let numerator = filteredData.reduce((acc, movie) => {
    let userOneRating = convertStarRating(movie.userOneRating);
    let userTwoRating = convertStarRating(movie.userTwoRating);

    return acc + (userOneRating - userOneMean) * (userTwoRating - userTwoMean);
  }, 0);

  // Calculate the variance for each user's ratings
  let userOneVariance = userOneRatings.reduce(
    (acc, rating) => acc + Math.pow(rating - userOneMean, 2),
    0,
  );
  let userTwoVariance = userTwoRatings.reduce(
    (acc, rating) => acc + Math.pow(rating - userTwoMean, 2),
    0,
  );

  // Calculate the denominator for the Pearson correlation coefficient
  let denominator = Math.sqrt(userOneVariance * userTwoVariance);

  // Calculate the compatibility score
  let rawScore = denominator === 0 ? 0 : numerator / denominator;
  // Convert to two decimal places for easier viewing
  let score = Math.round(rawScore * 100) / 100;

  // Convert the numerical compatibility score to a descriptive word
  let rating = convertCorrelationIntoLabel(score);

  // Return the compatibility score and its descriptive word
  // return `\nYour compatibility score is ${score}.\n${rating}`;
  return score;
}

// Helper function to convert the numerical compatibility score to a descriptive word. UNIT TESTS DONE
function convertCorrelationIntoLabel(correlation) {
  if (correlation === 1) {
    return "Soulmates: Your movie tastes are identical.";
  } else if (correlation > 1.0) {
    return "Error: Invalid correlation value.";
  } else if (correlation >= 0.9) {
    return "Peas in a Pod: Almost identical tastes.";
  } else if (correlation >= 0.8) {
    return "Great Match: You enjoy many of the same movies.";
  } else if (correlation >= 0.7) {
    return "Good Match: You often agree on movie choices.";
  } else if (correlation >= 0.6) {
    return "Fairly Similar: Your tastes align on several genres.";
  } else if (correlation >= 0.5) {
    return "Decent Match: You share some movie interests.";
  } else if (correlation >= 0.4) {
    return "Some Agreement: You like a few similar films.";
  } else if (correlation >= 0.3) {
    return "A Little Overlap: Some movies catch both your interests.";
  } else if (correlation >= 0.2) {
    return "Mild Overlap: Limited common ground in preferences.";
  } else if (correlation >= 0.1) {
    return "Hardly Alike: Minimal shared interests.";
  } else if (correlation > -0.1) {
    return "Worlds Apart: Almost no alignment in tastes.";
  } else if (correlation > -0.2) {
    return "Slightly Different: Just a little bit off.";
  } else if (correlation > -0.3) {
    return "Noticeable Differences: You often have different tastes.";
  } else if (correlation > -0.4) {
    return "Diverging Paths: Tastes are starting to differ.";
  } else if (correlation > -0.5) {
    return "Different Tastes: Your preferences are not aligned.";
  } else if (correlation > -0.6) {
    return "Distinctly Different: Noticeably opposing tastes.";
  } else if (correlation > -0.7) {
    return "Very Different: Movies you like are often not mutual.";
  } else if (correlation > -0.8) {
    return "Opposite Ends: Your choices frequently clash.";
  } else if (correlation > -0.9) {
    return "Polar Opposites: Generally opposing tastes.";
  } else if (correlation > -1) {
    return "Almost Completely Opposite: Highly different tastes.";
  } else if (correlation === -1.0) {
    return "Total Opposites: Complete disagreement in movie tastes.";
  } else {
    return "Error: Invalid correlation value.";
  }
}

// Helper function to convert star ratings to a numerical scale. UNIT TESTS DONE
function convertStarRating(rating) {
  const starMap = {
    "½": 0.5,
    "★": 1,
    "★½": 1.5,
    "★★": 2,
    "★★½": 2.5,
    "★★★": 3,
    "★★★½": 3.5,
    "★★★★": 4,
    "★★★★½": 4.5,
    "★★★★★": 5,
  };
  return starMap[rating] || null;
}

// Main function to run the program
async function main() {
  let userOne = null;
  let userTwo = null;
  let watchListOne = [];
  let watchListTwo = [];

  // Set new cacje that uses expiry date
  let cache = new CacheWithExpiry();
  // Read in cache from TXT file
  await readInCacheFromFile(posterCacheFilePath, cache);

  // Set new cache for scores. Stores the users last score for comparison reasons
  // FORMAT: username-username => {score, date}
  let scoreCache = new Map();
  // Read in scoreCache from TXT file
  await readInScoresFromFile(scoreCacheFilePath, scoreCache);
  console.log(scoreCache);

  // Get first user and their watchlist
  while (watchListOne.length === 0) {
    userOne = prompt("Enter the first user's Letterboxd username: ").trim();
    console.log(`Getting ${userOne}'s watched list...`);
    watchListOne = await getLetterboxdWatchlist(userOne);
    if (watchListOne.length === 0) {
      console.log(
        `Either this user does not exist or they haven't watched any movies \nPlease try another user`,
      );
      userOne = null;
    }
  }

  // Get second user and their watchlist
  while (watchListTwo.length === 0) {
    userTwo = prompt("Enter the second user's Letterboxd username: ").trim();
    console.log(`Getting ${userTwo}'s watched list...`);
    watchListTwo = await getLetterboxdWatchlist(userTwo);
    if (watchListTwo.length === 0) {
      console.log(
        `Either this user does not exist or they haven't watched any movies \nPlease try another user`,
      );
      userTwo = null;
    }
  }

  // Pull and store the userName-userName score from the cache in a var
  let userKey = [userOne, userTwo].sort().join("-");
  console.log(userKey);
  let oldUserUserScore = scoreCache.get(userKey);

  // Compare the watched lists and make new array of common films
  console.log("Comparing compatibility...");
  const commonFilms = compareWatchedLists(watchListOne, watchListTwo);
  console.log("common:", commonFilms);
  console.log("Creating output...");
  // Create the output
  let output = await createOutput(
    commonFilms,
    watchListOne,
    watchListTwo,
    cache,
  );

  // Print the results
  printOutput(output, userOne, userTwo);

  // Print user compatibility compatibility
  console.log("\nCalculating compatibility...");
  let compatibilityRating = calculateCompatibility(output);
  console.log("Old rating: ", oldUserUserScore);
  console.log("New rating: ", compatibilityRating);
  scoreCache.set(userKey, compatibilityRating);
  console.log(scoreCache);

  // Write cache to TXT file
  await writeCacheToFile(posterCacheFilePath, cache, "Poster cache");

  // Write new scores to TXT file
  await writeScoresToFile(scoreCacheFilePath, scoreCache, "Score cache");
}

if (require.main === module) {
  main(); // This runs only if the script is executed directly
}

module.exports = {
  convertStarRating,
  convertCorrelationIntoLabel,
  compareWatchedLists,
  createOutput,
  printOutput,
  calculateCompatibility,
};
