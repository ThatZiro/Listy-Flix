//===============================================================================
//================================= Variables ===================================
//===============================================================================
//Remove Debug Messages
const utilities_Logs = false;

//OMBD Key if we decide to use it
const OMBD_Key = 'eee9ecb3';

//TMDB Variables for queries
const TMDB_key = '337061be9657573ece2ab40bc5cb0965';
const TMDB_url = 'https://api.themoviedb.org/3';
const TMDB_movieEndpoint = '/search/movie';
const TMDB_actorEndpoint = '/search/person';
const TMDB_discoverEndpoint = '/discover/movie';
const TMDB_multiSearchEndpoint = '/search/multi';

//Temporary inputs for testing
let library = ['293660', '238', '13', '278', '118340']; // Temp Library
let ourInput = 'the last airbender'; // Temp Input

//Our options used for fetching data from APIS
const ourOptions = {
  method: 'GET',
  cache: 'reload',
};

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

//Run when the document is done loading
$(document).ready(function () {
  //WHEN search field is updated Update Search drop down
  $('#search-input').on('input', UpdateSearch);
  console.log('Document Ready!');
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================

//This function queries the database and sorts the results based on relativity
//Input users search
function UpdateSearch(e) {
  QueryResults($(this).val()).then((result) => {
    // console.log(result);
    UpdateDropdown(result.results, 10, $(this).val());
  });
}

//This function takes the array of movie results and displays them under the movie search bar
//Input array of movie results and number of results to display
function UpdateDropdown(Results, ResultsToDisplay, input) {
  //backdrop_path can access the image backdrop
  const posterUrl = `https://image.tmdb.org/t/p/original/`;
  $('#autoFillDiv').empty();
  for (let i = 0; i < ResultsToDisplay; i++) {
    if (i >= Results.length) {
      return;
    }
    let dropdownItem = $('<div></div>', {
      class:
        'dropdownItem bg-white border rounded autoFill p-1 text-gray-600 text-xl',
      id: Results[i].id,
    })
      .append(
        $('<img>', {
          src: `${posterUrl}${Results[i].poster_path}`, //TODO Null Check
          alt: '',
          // height: '100px',
          class: 'h-12 inline',
          id: 'poster',
        })
      )
      .append(
        $('<p>', {
          html: ` ${HighlightInput(Results[i].title, input)}`,
          class: 'inline',
          id: 'title',
        })
      )
      .append(
        $('<p>', {
          text: ` (${Results[i].release_date.split('-')[0]})`,
          class: 'inline',
          id: 'year',
        })
      );

    $('#autoFillDiv').append(dropdownItem);
  }
  $(`.dropdownItem`).on('click', LoadMoviePage);
}

function HighlightInput(text, input) {
  // Use a regular expression to find all occurrences of the substring in the main string
  const regex = new RegExp(input, 'gi');

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
    console.error('Error:', error);
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

//This function is used to get our recommendations
//Input How many movies we want to get
//returns a random array of movieData
function LoadMoviePage(e) {
  console.log(`Clicked movie ${$(this).attr('id')}`);
  let movieUrl = `${TMDB_url}/movie/${$(this).attr('id')}?api_key=${TMDB_key}`;

  ChangePage('movie', $(this).attr('id'));

  return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
    window.location;
    //Handle Certification
    GetCertification($(this).attr('id'))
      .then((certification) => {
        console.log(certification.certification);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    console.log(jsonData); //Main Object
    console.log(jsonData.title); //Movie Title
    console.log(jsonData.release_date); //Release Date
    console.log(jsonData.vote_average); //Vote Average
    console.log(jsonData.vote_count); //Vote Count
    console.log(jsonData.runtime); //runtime of movie
    console.log(jsonData.genres); //genre of movie - multiple genres
    console.log(jsonData.tagline); //tag line above description of movie
    console.log(jsonData.overview); // overview of the movie (description)
    // console.log(jsonData.director) //director
    // console.log(jsonData.featuring) //featuring
  });
}

function ChangePage(page, ref) {
  let newLocation = window.location.origin;
  console.log(page);
  switch (page) {
    case 'home':
      newLocation = window.location.origin;
      break;
    case 'movie': {
      newLocation = `${window.location.origin}/pages/movie.html?ref=${ref}`;
      break;
    }
    case 'library': {
      newLocation = window.location.origin + `/pages/library.html`;
      break;
    }
  }
  console.log(newLocation);
  window.location.href = newLocation;
}

//This function is used to get most recent movie certification from another fetch call
//Input Movie ID
//returns String containing most recent rating
async function GetCertification(id) {
  let certificationUrl = `${TMDB_url}/movie/${id}/release_dates?api_key=${TMDB_key}`;
  // let url = `https://api.themoviedb.org/3/movie/335984/release_dates?api_key=337061be9657573ece2ab40bc5cb0965`;

  try {
    const certificationData = await GetApiJson(certificationUrl, ourOptions);
    const usCertification = await certificationData.results.find(
      (result) => result.iso_3166_1 === 'US'
    );

    if (usCertification && usCertification.release_dates.length > 0) {
      const latestCertification =
        usCertification.release_dates[usCertification.release_dates.length - 1];
      return latestCertification;
    } else {
      return `Certification not avalible`;
    }
  } catch (error) {
    console.error('Error fetching certification data:', error);
    throw error;
  }
}

var splide = new Splide('.splide', {
  type: 'loop',
  perPage: 3,
  focus: 'center',
});

splide.mount();
//==================================================================================
