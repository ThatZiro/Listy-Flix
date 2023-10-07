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
      throw new Error(
        `Error Getting API: ${response.status + response.statusText}`
      );
    }

    console.log(`Successfully fetched api at ${requestUrl}`);
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
  let words = string.split(" ");

  let capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return capitalizedWords.join(" ");
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
  console.log("Data Retrieved from Local Storage");
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
  console.log("Data Saved to Local Storage");
}
