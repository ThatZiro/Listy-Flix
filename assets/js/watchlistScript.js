//===============================================================================
//================================= Variables ===================================
//===============================================================================
//Remove Debug Messages
const utilities_Logs = false;

//TMDB Variables for queries
const TMDB_key = '337061be9657573ece2ab40bc5cb0965';
const TMDB_url = 'https://api.themoviedb.org/3';
const TMDB_movieEndpoint = '/search/movie';
const TMDB_actorEndpoint = '/search/person';
const TMDB_discoverEndpoint = '/discover/movie';
const TMDB_multiSearchEndpoint = '/search/multi';

//Our options used for fetching data from APIS
const ourOptions = {
  method: 'GET',
  cache: 'reload',
};

let watchlistIDS;
let watchListData;

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

//Run when the document is done loading
$(document).ready(function () {
  GetWatchList();

  $('#watchlist').on('click', GoToMovie);
  // GetRecommendations();
});

function GetWatchList() {
  watchlistIDS = GetData('WatchList');
  console.log(watchlistIDS);

  watchListData = [];
  if (watchlistIDS != null) {
    $('#watchlist p').hide();
    for (const movie of watchlistIDS) {
      let movieUrl = `${TMDB_url}/movie/${movie}}?api_key=${TMDB_key}`;
      GetApiJson(movieUrl, ourOptions).then((jsonData) => {
        watchListData.push(jsonData);
        AddMoviesToPage(jsonData);
      });
    }
  }

  console.log(watchListData);
}

function AddMoviesToPage(movieData) {
  console.log('Add');
  //TODO If MovieData is empty display "Get some movies"
  const posterUrl = `https://image.tmdb.org/t/p/original/`;
  let poster = `${posterUrl}${movieData.poster_path}`;
  $('#watchlist').append(
    $('<img>', {
      src: poster,
      alt: '',
      class: 'lg:h-72 sm:h-56 h-36 inline m-3 transform hover:scale-110 cursor-pointer rounded-xl shadow',
      id: movieData.id,
    })
  );
}

function GoToMovie(e) {
  console.log($(e.target));
  let item = $(e.target);

  let oldLocation = window.location.pathname.split('/');
  oldLocation.pop();
  let newLocation = `${oldLocation.join('/')}/movie.html?ref=${item.attr('id')}`;
  window.location.href = newLocation;
}

function GoToMovie(e) {
  console.log($(e.target));
  let item = $(e.target);

  let oldLocation = window.location.pathname.split('/');
  oldLocation.pop();
  let newLocation = `${oldLocation.join('/')}/movie.html?ref=${item.attr('id')}`;
  window.location.href = newLocation;
}

//This function is used to get our recommendations
//Input How many movies we want to get
//returns a random array of movieData
async function GetRecommendations() {
  movies = GetData('WatchList');

  //TODO Null Check
  let genres = [];
  let actors = [];

  //Gets Movies and adds there genres to genres array
  const apiPromisesMovie = movies.map((movie) => {
    let movieUrl = `${TMDB_url}/movie/${movie}?api_key=${TMDB_key}`;
    return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
      jsonData.genres.forEach((element) => {
        genres.push(element.id);
      });
    });
  });

  //Gets Movie Credits and adds the cast to actors array
  const apiPromisesActor = movies.map((movie) => {
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
