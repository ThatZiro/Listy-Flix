//===============================================================================
//=========================== Configuration Variables ==========================
//===============================================================================

const utilities_Logs = false; // Set to 'false' to disable debug messages from utlities.

const toggleStreamAvalability = true; // Set to 'false' to disable stream avalability from showing.

const TMDB_key = '337061be9657573ece2ab40bc5cb0965'; // The API key for The Movie Database (TMDB).
const TMDB_url = 'https://api.themoviedb.org/3'; // Base URL for TMDB API.
const TMDB_posterUrl = `https://image.tmdb.org/t/p/original`; //Base URL for TMDB Posters.
const TMDB_movieEndpoint = '/search/movie'; // Endpoint for searching movies on The Movie Database (TMDB).

// Options for making API requests to (TMDB).
const ourOptions = {
  method: 'GET',
  cache: 'reload',
};

// Base URL for (SA) Streaming Avalability API
const SA_url = `https://streaming-availability.p.rapidapi.com/get?output_language=en`;

// Options for making API requests to (SA)
const SA_options = {
  method: 'GET',
  headers: {
    //'X-RapidAPI-Key': '9d900f40famshab4ec5577e22c8bp15bb35jsn4815264ed7b7', // Brandon's key
    'X-RapidAPI-Key': 'e517718793mshc32498728a54ef2p1d6902jsn24ec7261a3d8', // Jared's key
    // 'X-RapidAPI-Key': '0368508b97msh09a48829a6827d0p1ea4b9jsn4b2d070dbc10', // Jorlyna's key
    'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
  },
};

//===============================================================================
//=============================== Admin Tools ==================================
//===============================================================================

// Function: Clear Watchlist
/**
 * Clears the watchlist data when the user presses Ctrl + C.
 * This is an admin tool.
 */
$(document).keydown(function (event) {
  if (event.ctrlKey && event.key === 'c') {
    // Remove the 'WatchList' item from local storage.
    localStorage.removeItem('WatchList');

    // Display an alert to indicate that the data has been cleared.
    alert('ADMIN: Movies Cleared From Local Storage');
  }
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================
/**
 * Fetches data from a specified API endpoint with customizable options and returns it as a JSON object.
 *
 * @param {string} requestUrl - The URL of the API endpoint to fetch data from.
 * @param {Object} options - Customizable options for the fetch request (e.g., headers, method).
 * @returns {Promise<any>} A Promise that resolves with the fetched JSON data or rejects with an error message.
 */
async function GetApiJson(requestUrl, options) {
  try {
    const response = await fetch(requestUrl, options);

    if (!response.ok) {
      throw new Error(`Error Getting API: ${response.status + response.statusText}`);
    }

    if (utilities_Logs) console.log(`Successfully fetched api at ${requestUrl}`);
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}
//=============================================================================================================
/**
 * Converts a Unix timestamp to a JavaScript Date object.
 *
 * @param {number} unix - The Unix timestamp to be converted (in seconds).
 * @returns {Date} A Date object representing the converted timestamp.
 */
function UnixToDate(unix) {
  return new Date(unix * 1000);
}
//=============================================================================================================
/**
 * Capitalizes the first letter of each word in a given string.
 *
 * @param {string} string - The input string to be capitalized.
 * @returns {string} A new string with the first letter of each word capitalized.
 */
function CapitalizeStringWords(string) {
  let words = string.split(' ');

  let capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return capitalizedWords.join(' ');
}
//=============================================================================================================
/**
 * Retrieves data from local storage and parses it as JSON.
 *
 * @param {string} item - The key under which the data is stored in local storage.
 * @returns {any} The parsed data retrieved from local storage, or null if not found.
 */
function GetData(item) {
  let data = localStorage.getItem(item);
  console.log('Data Retrieved from Local Storage');
  return JSON.parse(data);
}
//=============================================================================================================
/**
 * Stores data in local storage after converting it to JSON format.
 *
 * @param {string} item - The key under which the data will be stored in local storage.
 * @param {any} data - The data to be stored in local storage (will be converted to JSON format).
 */
function SetData(item, data) {
  let jsonData = JSON.stringify(data);
  localStorage.setItem(item, jsonData);
  console.log('Data Saved to Local Storage');
}
//=============================================================================================================
/**
 * Selects the most frequent items from an array and breaks ties randomly.
 *
 * @param {Array} array - The input array containing items.
 * @param {number} count - The number of most frequent items to select.
 * @returns {Array} - An array containing the selected most frequent items.
 */
function GetMostFrequent(array, count) {
  let counts = {};
  array.forEach((item) => {
    let key = item.toString();
    counts[item] = (counts[key] || 0) + 1;
  });

  let itemCountsArray = Object.entries(counts).map(([item, count]) => ({
    item,
    count,
  }));
  itemCountsArray.sort((a, b) => b.count - a.count);

  let returnItems = [];

  for (let i = 0; i < count - 1; i++) {
    returnItems.push(itemCountsArray.shift());
  }

  let highestItem = [];

  for (const item of itemCountsArray) {
    if (item.count === itemCountsArray[0].count) {
      highestItem.push(item);
    }
  }

  returnItems.push(highestItem[Math.floor(Math.random() * highestItem.length)]);

  return returnItems.map((item) => item.item);
}
//=============================================================================================================
/**
 * Sorts an array of strings based on their character reletivity to an input string.
 *
 * @param {Array} array - The input array containing strings to be sorted.
 * @param {string} input - The reference input string for sorting.
 */
function SortArrayByReletivity(array, input) {
  for (const item of array) {
    let weight = 0;
    for (const char of input) {
      let location = item.indexOf(char) + 1;
      weight += location;
    }
    console.log(item + ' | ' + weight);
  }
}
