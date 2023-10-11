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
});

function GetWatchList() {
  watchlistIDS = GetData('WatchList');
  console.log(watchlistIDS);

  watchListData = [];
  for (const movie of watchlistIDS) {
    let movieUrl = `${TMDB_url}/movie/${movie}}?api_key=${TMDB_key}`;
    GetApiJson(movieUrl, ourOptions).then((jsonData) => {
      watchListData.push(jsonData);
      AddMoviesToPage(jsonData);
    });
  }
  console.log(watchListData);
}

function AddMoviesToPage(movieData) {
  console.log('Add');
  const posterUrl = `https://image.tmdb.org/t/p/original/`;
  let poster = `${posterUrl}${movieData.poster_path}`;
  $('#watchlist').append(
    $('<img>', {
      src: poster,
      alt: '',
      class: 'h-56 inline m-3 transform hover:scale-110 cursor-pointer',
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
