const cheerio = require("cheerio");
const prompt = require("prompt-sync")();
const { fetchPage, getInfoFromFilmPage } = require("./sharedFunctions.js");

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
async function displayOutput(commonMovies) {
  for (let i = 0; i < commonMovies.length; i++) {
    const filmName = commonMovies[i][0];
    const filmSlug = commonMovies[i][1];
    const filmInfo = await getInfoFromFilmPage(filmSlug);
    const posterURL = filmInfo[0];
    const rating = filmInfo[1];

    console.log(
      `Film name: ${filmName} \nLetterBoxd Average User Rating: ${rating}\nPoster: ${posterURL}`,
    );
  }
}

// Main function to run program
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

  const commonMovies = compareWatchLists(watchListOne, watchListTwo);
  displayOutput(commonMovies);
})();
