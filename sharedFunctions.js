const axios = require("axios");
const cheerio = require("cheerio");

// Helper delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to get the HTML from the URL. :INTERGRATION TEST NEEDED
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

// Helper function to get info from the FilmPage in one request. INTERGRATION TEST NEEDED
async function getInfoFromFilmPage(filmSlug) {
  const url = `https://letterboxd.com/film/${filmSlug}`;
  const filmPage = await fetchPage(url);
  const $ = cheerio.load(filmPage);
  const scriptTag = $('script[type="application/ld+json"]').html();

  const posterRegex = /"image":"(https:\/\/[^"]+)"/;
  const posterMatch = scriptTag.match(posterRegex);

  const ratingRegex = /"ratingValue":(\d+\.\d+)/;
  const ratingMatch = scriptTag.match(ratingRegex);

  let output = [null, null];

  if (posterMatch) {
    output[0] = posterMatch[1];
  } else {
    output[1] = "Poster not found";
  }

  if (ratingMatch) {
    output[1] = ratingMatch[1];
  } else {
    output[1] = "Rating not found";
  }

  return output;
}

module.exports = {
  fetchPage,
  delay,
  getInfoFromFilmPage,
};
