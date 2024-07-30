const axios = require("axios");
const cheerio = require("cheerio");
const prompt = require("prompt-sync")();

async function fetchPage(url) {
  try {
    const repsonse = await axios.get(url);
    return repsonse.data;
  } catch (error) {
    return null;
  }
}

async function getLetterboxdWatchlist(username) {
  let watchlist = [];
  let page = 1;
  const maxWorkers = 10;
  let futures = [];

  while (true) {
    const url = `https://letterboxd.com/${username}/watchlist/page/${page}`;
    futures.push(fetchPage(url));
    page += 1;
    if (futures.length >= maxWorkers) {
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

    async films.each((index, film) => {
      const titleTag = $(film).find("img.image");
      const filmSlug = $(film).find("");
      const commonRating = await pullRating(filmSlug);
      if (titleTag) {
        const title = titleTag.attr("alt");
        watchlist.push([title, commonRating]);
      }
    });
  }

  return watchlist;
}

async function pullRating(filmSlug) {
  const url = `https://letterboxd.com/film/${filmSlug}`;
  const filmPage = await fetchPage(url);
  const $ = cheerio.load(filmPage);

  const rating = ;
  return rating;
}

function compareLists(listOne, listTwo) {
  const setOne = new Set(listOne);
  const setTwo = new Set(listTwo);

  const commonMovies = [...setOne].filter((item) => setTwo.has(item));
  return commonMovies;
}

(async () => {
  const userOne = prompt("Enter the first user's Letterboxd username: ");
  const userTwo = prompt("Enter the second user's Letterboxd username: ");

  const watchListOne = await getLetterboxdWatchlist(userOne);
  const watchListTwo = await getLetterboxdWatchlist(userTwo);

  if (!Array.isArray(watchListOne) || !Array.isArray(watchListTwo)) {
    console.error("One of the watchlists is not an array");
    return;
  }

  const commonMovies = compareLists(watchListOne, watchListTwo);
  console.log("Common Movies:", commonMovies);
})();
