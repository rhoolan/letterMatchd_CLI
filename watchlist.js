const axios = require("axios");
const cheerio = require("cheerio");
const prompt = require("prompt-sync")();

// Helper function to get the HTML from the URL
async function fetchPage(url) {
  try {
    const repsonse = await axios.get(url);
    return repsonse.data;
  } catch (error) {
    return null;
  }
}

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

  return watchlist;
}

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

// Compare the two users lists
function compareLists(listOne, listTwo) {
  const commonMovies = listOne.filter((subarray1) =>
    listTwo.some(
      (subarray2) => JSON.stringify(subarray1) === JSON.stringify(subarray2),
    ),
  );

  return commonMovies;
}

async function displayOutput(commonMovies) {
  for (let i = 0; i < commonMovies.length; i++) {
    const filmName = commonMovies[i][0];
    const filmSlug = commonMovies[i][1];
    const rating = await getAverageRating(filmSlug);
    console.log(
      `Film name: ${filmName} \nLetterBoxd Average User Rating: ${rating}\n`,
    );
  }
}

(async () => {
  const userOne = prompt("Enter the first user's Letterboxd username: ").trim();
  const userTwo = prompt(
    "Enter the second user's Letterboxd username: ",
  ).trim();

  const watchListOne = await getLetterboxdWatchlist(userOne);
  const watchListTwo = await getLetterboxdWatchlist(userTwo);

  if (!Array.isArray(watchListOne) || !Array.isArray(watchListTwo)) {
    console.error("One of the watchlists is not an array");
    return;
  }

  const commonMovies = compareLists(watchListOne, watchListTwo);
  displayOutput(commonMovies);
})();
