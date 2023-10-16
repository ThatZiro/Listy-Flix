//===============================================================================
//============================= Watchlist Variables =============================
//===============================================================================

let watchlistIDS; // Simply Stores the IDs for all movies in your watchlist
let watchListData; // Stores the Data for all movies in your watchlist

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

//Run when the document is done loading
$(document).ready(function () {
  // Initilize the page by setting the watchlistIDS and Data
  GetWatchList();

  // Attach Event Listeners
  $('#watchlist').on('click', GoToMovie);
  $('#recommended').on('click', GoToMovie);
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================

// Function: Get Watchlist
/**
 * Retrieves and displays movies in the user's watchlist.
 * @returns {void}
 */

function GetWatchList() {
  // Get the list of movie IDs from local storage.
  watchlistIDS = GetData('WatchList');

  watchListData = [];
  if (watchlistIDS != null) {
    // Hide the message if the watchlist is not empty
    $('#watchlist p').hide();

    // Iterate through each movie in the watchlist
    for (const movie of watchlistIDS) {
      // Construct URL for fetching movie data from (TMDB).
      let movieUrl = `${TMDB_url}/movie/${movie}}?api_key=${TMDB_key}`;

      //Fetch movie data from (TMDB) and add it to the watchlist Data.
      GetApiJson(movieUrl, ourOptions).then((jsonData) => {
        watchListData.push(jsonData);
        // Add the movie to the page.
        AddMoviesToPage(jsonData);
      });
    }
  }

  //Get Movie Recommedations.
  GetRecommendations();
}

// Function: Add Movies To Page
/**
 * Adds a movie poster to the watchlist on the page.
 * @param {Object} movieData - Movie data containing information about the movie.
 */
function AddMoviesToPage(movieData) {
  // Construct URL for fetching movie poster from (TMDB).
  let poster = `${TMDB_posterUrl}${movieData.poster_path}`;

  // Append the movie poster to the watchlist on the page.
  $('#watchlist').append(
    $('<img>', {
      src: poster,
      alt: '',
      class: 'lg:h-72 sm:h-56 h-36 inline m-3 transform hover:scale-110 cursor-pointer rounded-xl shadow',
      id: movieData.id,
    })
  );
}

// Function: Go To Movie
/**
 * Navigates to the movie page when a movie poster is clicked.
 *
 * @param {Event} e - The event object triggered by the user's click.
 */

function GoToMovie(e) {
  // Checks if the click target is an image.
  if (!$(e.target).is('img')) {
    return;
  }
  let item = $(e.target);

  // Split the current page URL and remove the last part.
  let oldLocation = window.location.pathname.split('/');
  oldLocation.pop();

  // Construct a new URL to the movie page.
  let newLocation = `${oldLocation.join('/')}/movie.html?ref=${item.attr('id')}`;

  // Navigate to the new page.
  window.location.href = newLocation;
}

// Function: Get Recommendations
/**
 * Fetches movie recommendations based on the user's watchlist, genres, and actors.
 */
async function GetRecommendations() {
  // Get the user's watchlist.
  let movies = GetData('WatchList');

  let genres = [];
  let actors = [];

  // Gets movies and adds there genres to the genres array.
  const apiPromisesMovie = movies.map((movie) => {
    let movieUrl = `${TMDB_url}/movie/${movie}?api_key=${TMDB_key}`;
    return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
      jsonData.genres.forEach((element) => {
        genres.push(element.id);
      });
    });
  });

  // Gets movie credits and adds the cast to the actors array
  const apiPromisesActor = movies.map((movie) => {
    let actorsUrl = `${TMDB_url}/movie/${movie}/credits?api_key=${TMDB_key}`;
    return GetApiJson(actorsUrl, ourOptions).then((jsonData) => {
      jsonData.cast.forEach((element) => {
        actors.push(element.name);
      });
    });
  });

  // Wait for Movie and Actions to populate.
  await Promise.all(apiPromisesMovie);
  await Promise.all(apiPromisesActor);

  //Get top genres and actors.
  let topGenres = GetMostFrequent(genres, 5);
  let topActors = GetMostFrequent(actors, 5);
  let movieList = [];

  // Fetch movies for top genres.
  for (const genre of topGenres) {
    let genreUrl = `${TMDB_url}/discover/movie?api_key=${TMDB_key}&with_genres=${genre}`;
    let data = await GetApiJson(genreUrl, ourOptions);
    let top3 = data.results.splice(0, 3);
    for (let i = 0; i < top3.length; i++) {
      movieList.push(top3[i]);
    }
  }

  // Fetch movies for top actors.
  for (const actor of topActors) {
    let actorUrl = `${TMDB_url}/search/person?api_key=${TMDB_key}&query=${actor}`;
    let data = await GetApiJson(actorUrl, ourOptions);
    let top3 = data.results[0].known_for.splice(0, 3);
    for (let i = 0; i < top3.length; i++) {
      movieList.push(top3[i]);
    }
  }

  // Filter out movies already in watchlist.
  movieList = movieList.filter((movie) => {
    return !movies.includes(movie.id.toString());
  });

  // Remove duplicates.
  movieList = movieList.filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id));

  let recommendationsList = [];

  // Select 5 recommended movies.
  for (let i = 0; i < 5; i++) {
    let index = Math.floor(Math.random() * movieList.length);
    recommendationsList.push(movieList[index]);
    movieList.splice(index, 1);
  }

  // Iterate through recommendations list.
  for (const rec of recommendationsList) {
    // Construct poster URL
    let poster = `${TMDB_posterUrl}${rec.poster_path}`;

    // Create Img on screen within recommended movie list.
    $('#recommended').append(
      $('<img>', {
        src: poster,
        alt: '',
        class: 'lg:h-72 sm:h-56 h-36 inline m-3 transform hover:scale-110 cursor-pointer rounded-xl shadow',
        id: rec.id,
      })
    );
  }
}
