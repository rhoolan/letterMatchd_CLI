const axios = require("axios");
const cheerio = require("cheerio");

// Helper delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Async function to get the HTML contents of the URL
async function fetchPage(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    // Catch for if the rate limit is exceeded (Error code 429)
    if (error.response && error.response.status === 429) {
      const delayTime = 1000;
      // console.error(
      //   `Rate limit exceeded, Waiting ${delayTime / 1000} second(s)`,
      // );
      // wait for 1 second
      await delay(delayTime);
      // retry
      return fetchPage(url);
    } else {
      // Print error and return null for any other error
      console.error(error);
      return null;
    }
  }
}

// Gets the TMDB number from the film's letterbox page.
async function getTMDBNumber(filmSlug) {
  const url = `https://letterboxd.com/film/${filmSlug}`;
  const html = await fetchPage(url);

  // Will return an error message if there is no page for the film.
  if (!html) {
    console.error("Failed to fetch Film's letterboxd page");
    return null;
  }

  // Gets the link for the TMDB page
  const $ = cheerio.load(html);
  const link = $('a[href*="themoviedb.org"]').attr("href");

  // Returns error if there is no TMDB number
  if (!link) {
    console.error("TMDB link not found");
    return null;
  }

  // Send the link to the helper function to extract the code
  const TMDBCode = extractTMDBCodeFromUrl(link);
  return TMDBCode;
}

// Helper function to extract the code from the URL
function extractTMDBCodeFromUrl(url) {
  // Regex to match the string of digits at the url
  const regex = /(\d+)\/?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = { getTMDBNumber };
