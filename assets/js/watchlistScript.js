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
  $('#recommended').on('click', GoToMovie);
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
  GetRecommendations();
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
  if (!$(e.target).is('img')) {
    return;
  }
  console.log(e.target);
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
  let movies = GetData('WatchList');

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
    let actorsUrl = `${TMDB_url}/movie/${movie}/credits?api_key=${TMDB_key}`;
    return GetApiJson(actorsUrl, ourOptions).then((jsonData) => {
      jsonData.cast.forEach((element) => {
        actors.push(element.name);
      });
    });
  });

  await Promise.all(apiPromisesMovie);
  await Promise.all(apiPromisesActor);

  //Get top x amount of each genre and actors
  let topGenres = GetMostFrequent(genres, 5);
  let topActors = GetMostFrequent(actors, 5);
  //TODO Add functionality to get movie list based on genres and actors
  let movieList = [];

  for (const genre of topGenres) {
    //Get 5 Movies
    let genreUrl = `${TMDB_url}/discover/movie?api_key=${TMDB_key}&with_genres=${genre}`;
    let data = await GetApiJson(genreUrl, ourOptions);
    let top3 = data.results.splice(0, 3);
    for (let i = 0; i < top3.length; i++) {
      movieList.push(top3[i]);
    }
  }

  for (const actor of topActors) {
    let actorUrl = `${TMDB_url}/search/person?api_key=${TMDB_key}&query=${actor}`;
    let data = await GetApiJson(actorUrl, ourOptions);
    let top3 = data.results[0].known_for.splice(0, 3);
    for (let i = 0; i < top3.length; i++) {
      movieList.push(top3[i]);
    }
  }

  movieList = movieList.filter((movie) => {
    return !movies.includes(movie.id.toString());
  });
  console.log(movieList);
  movieList = movieList.filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id));
  console.log(movieList);

  let recommendationsList = [];
  //5 Recommended Movies
  for (let i = 0; i < 5; i++) {
    let index = Math.floor(Math.random() * movieList.length);
    recommendationsList.push(movieList[index]);
    movieList.splice(index, 1);
  }

  console.log(recommendationsList);

  for (const rec of recommendationsList) {
    const posterUrl = `https://image.tmdb.org/t/p/original/`;
    let poster = `${posterUrl}${rec.poster_path}`;
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
