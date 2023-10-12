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

let carouselMovieList = [
  '926393',
  '872585',
  '951491',
  '670292',
  '1008042',
  '1002185',
  '976573',
  '502356',
  '20352',
  '111',
  '24428',
  '769',
  '545611',
  '24',
  '569094',
  '9479',
  '22538',
  '155',
  '120',
  '680',
  '550',
  '27205',
  '157336',
  '11',
  '129',
  '244786',
  '299534',
  '489',
];
let splide;
let search = '';
splideCount = -1;

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
  console.log('Document Ready!');
  $('#search-input').on('input', UpdateSearch);
  LoadCarousel();
  $(window).on('resize', ScaleSplide);
  $(`#autoFillDiv`).on('click', LoadMoviePage);
});
$(window).on('beforeunload', function () {
  $('#search-input').val("");
});
//===============================================================================
//================================= Functions ===================================
//===============================================================================

function ScaleSplide() {
  let width = $(window).width();

  let newcount = 5;
  if (width > 1500) {
    newcount = 5;
  } else if (width > 1250) {
    newcount = 4;
  } else if (width > 1000) {
    newcount = 3;
  } else if (width > 750) {
    newcount = 2;
  } else {
    newcount = 1;
  }
  if (newcount != splideCount) {
    splideCount = newcount;
    initilizeSplide(splideCount);
  }
}
//This function handles loading the carousel when the home page loads
function LoadCarousel() {
  const shuffledArray = carouselMovieList.slice().sort(() => Math.random() - 0.5);

  const posterUrl = `https://image.tmdb.org/t/p/original`;

  for (let i = 0; i < shuffledArray.length; i++) {
    const movie = shuffledArray[i];
    let movieUrl = `${TMDB_url}/movie/${movie}?api_key=${TMDB_key}`;
    GetApiJson(movieUrl, ourOptions).then((jsonData) => {
      $(`.${movie}`).attr('src', `${posterUrl}${jsonData.poster_path}`);
      $(`.${movie}`).attr('data-backdrop', `${posterUrl}${jsonData.backdrop_path}`);
      ScaleSplide();
    });

    let movieDiv = $('<li></li>', {
      class: 'splide__slide',
    });
    let movieHolder = $('<div></div>', {
      class: `posterhover flex justify-center`,
    });
    let movieA = $('<a></a>', {
      href: `./pages/movie.html?ref=${movie}`,
    });

    let movieImg = $('<img>', {
      src: `./assets/images/stock-poster.png`,
      class: ` h-80 m-1 cursor-pointer border-2 border-white rounded-2xl ${movie}`,
    });
    movieDiv.append(movieHolder);
    movieHolder.append(movieA);
    movieA.append(movieImg);

    $('#carouselMovieList').append(movieDiv);
  }
}
//This function queries the database and sorts the results based on relativity
//Input users search
function UpdateSearch(e) {
  var thisSearch = $(this).val();
  search = thisSearch;
  setTimeout(function () {
    if (search == thisSearch) {
      SearchBuffer();
    }
  }, 50);
}

function SearchBuffer() {
  QueryResults(search).then((result) => {
    // console.log(result);
    UpdateDropdown(result.results, 5, search);
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

    let poster = `${posterUrl}${Results[i].poster_path}`;
    if (Results[i].poster_path == null) {
      poster = `./assets/images/stock-poster.png`;
      console.log(poster);
    }

    let dropdownItem = $('<div></div>', {
      class: 'dropdownItem bg-white border rounded autoFill p-1 text-gray-600 text-xl',
      id: Results[i].id,
    })
      .append(
        $('<img>', {
          src: poster, //TODO Null Check
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
}

//This function hightlights the text in the dropdown menu based on your input
function HighlightInput(text, input) {
  console.log(input);
  // Use a regular expression to find all occurrences of the substring in the main string
  const regex = new RegExp(input, 'gi');

  // Replace all occurrences of the substring with the wrapped version
  const highlightedString = text.replace(regex, `<span class="highlight">$&</span>`);

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
  console.log($(e.target));
  let item = $(e.target);
  if (!$(e.target).hasClass('dropdownItem')) {
    item = $(e.target).closest('.dropdownItem');
  }
  console.log(item.attr('id'));
  ChangePage('movie', item.attr('id'));
}

//This function is used to change the page
//Input page you want to go to and page refereance if we are going to the movie page else ref can be ""
function ChangePage(page, ref) {
  let oldLocation = window.location.pathname.split('/');
  oldLocation.pop();
  let newLocation;

  switch (page) {
    case 'movie': {
      newLocation = `${oldLocation.join('/')}/pages/movie.html?ref=${ref}`;
      break;
    }
    case 'library': {
      newLocation = `${oldLocation.join('/')}/pages/library.html`;
      break;
    }
  }
  window.location.href = newLocation;
}

function initilizeSplide(count) {
  console.log('Splide');
  if (splide) {
    splide.options.perPage = splideCount;
    splide.destroy(true);
  }

  splide = new Splide('.splide', {
    type: 'loop',
    perPage: count,
    focus: 'center',
    wheel: true,
    wheelSleep: '100',
    keyboard: true,
    autoplay: true, // Enable autoplay
    autoplayOptions: {
      start: 'center',
      pauseOnHover: false,
      waitForTransition: true,
    },
    autoplaySpeed: 2000, // Adjust the autoplay speed (in milliseconds)
  });
  splide.mount();
  UpdateSlideBackground();
  splide.on('moved', function () {
    UpdateSlideBackground();
  });
}

function UpdateSlideBackground() {
  let currentSlideIndex = splide.index;
  let currentSlideElement = splide.Components.Elements.slides[currentSlideIndex];

  //TODO On Moved put backdrop on background
  $('#backdrop').attr('src', `${$(currentSlideElement).find('img').data('backdrop')}`);
}

//==================================================================================
