// Import the required modules
const axios = require("axios");
const cheerio = require("cheerio");

// URL of the webpage to scrape
const url = "https://letterboxd.com/furafura/films/page/1"; // Replace with the URL you want to scrape

// Function to fetch HTML from the webpage
async function fetchHTML(url) {
  try {
    // Use Axios to make a GET request to the URL
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching the HTML: ${error.message}`);
    return null;
  }
}

// Function to scrape and display the HTML
async function scrapeHTML() {
  const html = await fetchHTML(url);

  if (!html) {
    console.error("Failed to retrieve HTML");
    return;
  }

  // Load the HTML into Cheerio
  const $ = cheerio.load(html);

  // Display the entire HTML of the webpage
  const entireHTML = $.html();
  console.log(entireHTML);
}

// Execute the scrapeHTML function
scrapeHTML();
