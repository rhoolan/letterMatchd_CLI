const cheerio = require("cheerio");
const prompt = require("prompt-sync")();
const { fetchPage, getInfoFromFilmPage } = require("./sharedFunctions.js");
const { readCacheFile } = require("./caching.js");

// Cache file path
const filePath = "./posterURLs.txt";

// Global variable for Cache
let cache = null;

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

// Get the users watched film list
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

  return watchlist;
}

// Compare the two users film lists
function compareWatchedLists(userOneList, userTwoList) {
  // Filter userOneList to only films that appear in userTwoList
  const sharedTitles = userOneList
    .filter((element1) =>
      userTwoList.some((element2) => element2.title === element1.title),
    )
    .map((element) => element.title);

  return sharedTitles;
}

// Create the output
async function createOutput(sharedTitles, userOneList, userTwoList) {
  // Wait for all sharedTitle requests to complete then map
  const promises = sharedTitles.map(async (title) => {
    const movieUserOne = userOneList.find((movie) => movie.title === title);
    const movieUserTwo = userTwoList.find((movie) => movie.title === title);
    const filmInfo = await getInfoFromFilmPage(movieUserOne.filmSlug);
    const posterURL = filmInfo[0];

    return {
      title,
      posterURL: posterURL,
      userOneRating: movieUserOne.rating,
      userTwoRating: movieUserTwo.rating,
    };
  });

  return await Promise.all(promises);
}

// Print the output in an easy to read way
function printOutput(output, userOne, userTwo) {
  for (let i = 0; i < output.length; i++) {
    let title = output[i];
    // console.log(title);
    console.log(
      `\nTitle: ${title.title}.\n${title.posterURL}\n${userOne}: ${title.userOneRating}.\n${userTwo}: ${title.userTwoRating}`,
    );
  }
}

// Calculate the users compatibility using the Pearson correlation coefficient
function calculateCompatibility(data) {
  // Extract and convert user ratings from the data
  let userOneRatings = data
    .map((movie) => movie.userOneRating)
    .map((rating) => convertStarRating(rating)); // Convert star rating to a numerical rating
  let userTwoRatings = data
    .map((movie) => movie.userTwoRating)
    .map((rating) => convertStarRating(rating)); // Convert star rating to a numerical rating

  // Calcuate the mean rating for each user
  let userOneMean =
    userOneRatings.reduce((a, b) => a + b, 0) / userOneRatings.length;
  let userTwoMean =
    userTwoRatings.reduce((a, b) => a + b, 0) / userTwoRatings.length;

  // Calculate the numerator for the Pearson correlation coefficient
  let numerator = data.reduce((acc, movie) => {
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
  let score = denominator === 0 ? 0 : numerator / denominator;

  // Convert the numerical compatibility score to a descriptive word
  let rating = convertCompatibilityNumberIntoWord(score);

  // Return the compatibility score and its descriptive word
  return `Your compatibility score is ${score} which mean you have a ${rating} compatibility!`;
}

// Helper function to convert the numerical compatibility score to a descriptive word
function convertCompatibilityNumberIntoWord(score) {
  if (score >= 0.0 && score < 0.1) {
    return "very weak";
  } else if (score >= 0.1 && score < 0.3) {
    return "weak";
  } else if (score >= 0.3 && score < 0.5) {
    return "moderate";
  } else if (score >= 0.5 && score < 0.7) {
    return "strong";
  } else if (score >= 0.7 && score < 0.9) {
    return "very strong";
  } else if (score >= 0.9 && score < 1) {
    return "nearly perfect";
  } else if (score === 1) {
    return "perfect";
  } else {
    return "Not a valid score";
  }
}

// Helper function to convert star ratings to a numerical scale
function convertStarRating(rating) {
  const starMap = {
    "½": 0.5,
    "★": 1,
    "★★": 2,
    "★★★": 3,
    "★★★½": 3.5,
    "★★★★": 4,
    "★★★★½": 4.5,
    "★★★★★": 5,
  };
  return starMap[rating] || 0;
}

// Main function to run the program
(async () => {
  let userOne = null;
  let userTwo = null;
  let watchListOne = [];
  let watchListTwo = [];

  // Read in cache
  cache = await readCacheFile(filePath);
  console.log(cache);
  while (watchListOne.length === 0) {
    userOne = prompt("Enter the first user's Letterboxd username: ").trim();
    watchListOne = await getLetterboxdWatchlist(userOne);
    if (watchListOne.length === 0) {
      console.log(
        `Either this user does not exist or they haven't watched any movies \nPlease try another user`,
      );
      userOne = null;
    }
  }

  while (watchListTwo.length === 0) {
    userTwo = prompt("Enter the second user's Letterboxd username: ").trim();
    watchListTwo = await getLetterboxdWatchlist(userTwo);
    if (watchListTwo.length === 0) {
      console.log(
        `Either this user does not exist or they haven't watched any movies \nPlease try another user`,
      );
      userTwo = null;
    }
  }

  console.log("Comparing compatibility...");
  const commonMovies = compareWatchedLists(watchListOne, watchListTwo);
  let output = await createOutput(
    commonMovies,
    watchListOne,
    watchListTwo,
    userOne,
    userTwo,
  );
  printOutput(output, userOne, userTwo);
  // show compatibility
  console.log(calculateCompatibility(output));
})();
