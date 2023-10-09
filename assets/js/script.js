//===============================================================================
//================================= Variables ===================================
//===============================================================================
//Remove Debug Messages
const utilities_Logs = false;

//OMBD Key if we decide to use it
const OMBD_Key = "eee9ecb3";

//TMDB Variables for queries
const TMDB_key = "337061be9657573ece2ab40bc5cb0965";
const TMDB_url = "https://api.themoviedb.org/3";
const TMDB_movieEndpoint = "/search/movie";
const TMDB_actorEndpoint = "/search/person";
const TMDB_discoverEndpoint = "/discover/movie";
const TMDB_multiSearchEndpoint = "/search/multi";

//Temporary inputs for testing
let library = ["293660", "238", "13", "278", "118340"]; // Temp Library
let ourInput = "the last airbender"; // Temp Input

//Our options used for fetching data from APIS
const ourOptions = {
  method: "GET",
  cache: "reload",
};

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

//Run when the document is done loading
$(document).ready(function () {
  //WHEN search field is updated Update Search drop down
  $("#search-input").on("input", UpdateSearch);
  console.log("Document Ready!");
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================

//This function queries the database and sorts the results based on relativity
//Input users search
function UpdateSearch(e) {
  QueryResults($(this).val()).then((result) => {
    console.log(result);
    UpdateDropdown(result.results, 10, $(this).val());
  });
}

//This function takes the array of movie results and displays them under the movie search bar
//Input array of movie results and number of results to display
function UpdateDropdown(Results, ResultsToDisplay, input) {
  //backdrop_path can access the image backdrop
  const posterUrl = `https://image.tmdb.org/t/p/original/`;
  $("#autoFillDiv").empty();
  for (let i = 0; i < ResultsToDisplay; i++) {
    if (i >= Results.length) {
      return;
    }
    let dropdownItem = $("<div>", {
      class: "bg-white border rounded autoFill p-1 text-gray-600 text-xl",
    })
      .append(
        $("<img>", {
          src: `${posterUrl}${Results[i].poster_path}`, //TODO Null Check
          alt: "",
          class: "h-12 inline",
          id: "poster",
        })
      )
      .append(
        $("<p>", {
          html: ` ${HighlightInput(Results[i].title, input)}`,
          class: "inline",
          id: "title",
        })
      )
      .append(
        $("<p>", {
          text: ` (${Results[i].release_date.split("-")[0]})`,
          class: "inline",
          id: "year",
        })
      );

    $("#autoFillDiv").append(dropdownItem);
  }
}

function HighlightInput(text, input) {
  // Use a regular expression to find all occurrences of the substring in the main string
  const regex = new RegExp(input, "gi");

  // Replace all occurrences of the substring with the wrapped version
  const highlightedString = text.replace(
    regex,
    `<span class="highlight">$&</span>`
  );

  return highlightedString;
}
//This function queries the database for search results based on passed input
//Input users search
//returns an array of relative results
async function QueryResults(input) {
  let url = `${TMDB_url}${TMDB_movieEndpoint}?api_key=${TMDB_key}&query=${input}`;
  try {
    const jsonData = await GetApiJson(url, ourOptions);
    return jsonData;
  } catch (error) {
    // Handle errors here, such as network issues or invalid input
    console.error("Error:", error);
    throw error;
  }
}

//This function is used to get our recommendations
//Input How many movies we want to get
//returns a random array of movieData
async function GetRecommendations(movies) {
  let genres = [];
  let actors = [];

  //Gets Movies and adds there genres to genres array
  const apiPromisesMovie = library.map((movie) => {
    let movieUrl = `${TMDB_url}/movie/${movie}?api_key=${TMDB_key}`;
    return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
      jsonData.genres.forEach((element) => {
        genres.push(element.id);
      });
    });
  });

  //Gets Movie Credits and adds the cast to actors array
  const apiPromisesActor = library.map((movie) => {
    let actorUrl = `${TMDB_url}/movie/${movie}/credits?api_key=${TMDB_key}`;
    return GetApiJson(actorUrl, ourOptions).then((jsonData) => {
      jsonData.cast.forEach((element) => {
        actors.push(element.name);
      });
    });
  });

  await Promise.all(apiPromisesMovie);
  await Promise.all(apiPromisesActor);

  //Get top x amount of each genre and actors
  console.log(GetMostFrequent(genres, 5));
  console.log(GetMostFrequent(actors, 5));
  //TODO Add functionality to get movie list based on genres and actors
}

/*
var splide = new Splide( '.splide', {
  type   : 'loop',
  perPage: 3,
  focus  : 'center',
} );

splide.mount();
*/