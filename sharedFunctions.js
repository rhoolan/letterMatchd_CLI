const axios = require("axios");
const cheerio = require("cheerio");

// Helper delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to get the HTML from the URL
async function fetchPage(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Catch for if the rate limit is exceeded (Error code 429)
      // console.error("Rate limit exceeded, Waiting...");
      // wait for 1 seccond
      await delay(1000);
      // retry
      return fetchPage(url);
    } else {
      // Print error and return null for any other error
      console.error(error);
      return null;
    }
  }
}

// Helper function to get the movies poster
async function getPoster(filmSlug) {
  const url = `https://letterboxd.com/film/${filmSlug}`;
  const filmPage = await fetchPage(url);
  const $ = cheerio.load(filmPage);
  const scriptTag = $('script[type="application/ld+json"]').html();

  const regex = /"image":"(https:\/\/[^"]+)"/;
  const match = scriptTag.match(regex);

  if (match) {
    const posterURL = match[1];
    return posterURL;
  } else {
    return "Poster not found";
  }
}

// Function to get the average rating of a film from its page
async function getAverageRating(filmSlug) {
  const url = `https://letterboxd.com/film/${filmSlug}`;
  const filmPage = await fetchPage(url);
  const $ = cheerio.load(filmPage);
  const scriptTag = $('script[type="application/ld+json"]').html();

  const regex = /"ratingValue":(\d+\.\d+)/;
  const match = scriptTag.match(regex);

  if (match) {
    const ratingValue = match[1];
    return ratingValue;
  } else {
    return "Rating Value not found";
  }
}

module.exports = { fetchPage, delay, getPoster, getAverageRating };
