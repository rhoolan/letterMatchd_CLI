const fetch = require("node-fetch");

async function getTMDBData(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDNkYzI1NzMyMzZlMWEyZWNjZTQ5NDZhZTQ0NmVlNiIsInN1YiI6IjY2NjAxZTRlMGFjOGQ3NzUyNGM5MDk0NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.D0OMV_tXp5YFBsNGKTzuoFNUbDAOHVgYz4onODOwQJM",
    },
  };

  try {
    const res = await fetch(url, options);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("error:", err);
  }
}

module.exports = { getTMDBData };
