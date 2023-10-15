//===============================================================================
//============================= Homepage Variables =============================
//===============================================================================

// List of movie IDs for the homepage carousel.
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

let splide; // Splide slider instance.
let splideCount = -1; // Counter for Splide carousel items (Initilize -1).

let search = ''; // Search Input Field.

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

// Run when the document is fully loaded.
$(document).ready(function () {
  // Intilize page by loading the carousel on the page.
  LoadCarousel();

  // Attach Event Listeners.
  $('#search-input').on('input', UpdateSearch);
  $(`#autoFillDiv`).on('click', LoadMoviePage);

  // When the window is about to unload (e.g., when navigating away from the page), clear the search input field.
  $(window).on('beforeunload', function () {
    $('#search-input').val('');
  });
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================

// Function: Scale Splide
/**
 *  Adjust the number of visible slides in the Splide carousel based on the screen width.
 */
function ScaleSplide() {
  // Get Window Width.
  let width = $(window).width();

  // Change Count based on Width.
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

  //Create New Splide if Splide Count Changes.
  if (newcount != splideCount) {
    splideCount = newcount;
    InitilizeSplide(splideCount);
  }
}

// Function: Load Carousel
/**
 *  Loads and populates the homepage carousel with movie posters.
 */
function LoadCarousel() {
  // Shuffle the movie list before displaying.
  const shuffledArray = carouselMovieList.slice().sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffledArray.length; i++) {
    const movie = shuffledArray[i];
    let movieUrl = `${TMDB_url}/movie/${movie}?api_key=${TMDB_key}`;

    // Fetch Movie Data from TMDB API.
    GetApiJson(movieUrl, ourOptions).then((jsonData) => {
      // Set Poster adn backdrop images for the movies.
      $(`.${movie}`).attr('src', `${TMDB_posterUrl}${jsonData.poster_path}`);
      $(`.${movie}`).attr('data-backdrop', `${TMDB_posterUrl}${jsonData.backdrop_path}`);

      // Once all movie data is loaded, adjust the Splide Carousel to Initilize.
      if (i == shuffledArray.length - 1) {
        ScaleSplide();
      }
    });

    // Create HTML elements for each movie in the carousel.
    let movieDiv = $('<li></li>', {
      class: 'splide__slide',
    });
    let movieHolder = $('<div></div>', {
      class: `posterhover flex justify-center`,
    });
    let movieA = $('<a></a>', {
      href: `./pages/movie.html?ref=${movie}`,
    });

    // Set default image for movies to override later
    let movieImg = $('<img>', {
      src: `./assets/images/stock-poster.png`,
      class: ` h-80 m-1 cursor-pointer border-2 border-white rounded-2xl ${movie}`,
    });

    // Assemble the HTML structure for each movie.
    movieDiv.append(movieHolder);
    movieHolder.append(movieA);
    movieA.append(movieImg);

    // Append the movie element to the carousel list.
    $('#carouselMovieList').append(movieDiv);
  }
}

// Function: Update Search
/**
 *  Queries the Database based on user input and adds a buffer to inputs.
 *
 * @param {event} e - The input event object.
 */
function UpdateSearch(e) {
  var thisSearch = $(this).val();
  search = thisSearch;

  //Delay the search action by 50 milliseconds to allow user input to stabalize.
  setTimeout(function () {
    if (search == thisSearch) {
      //Update the search results.
      SearchBuffer();
    }
  }, 50);
}

// Function: Search Buffer
/**
 * Initiates a database query and updates the dropdown.
 */
function SearchBuffer() {
  QueryResults(search).then((result) => {
    // Update the search dropdown with the results showing up to 5 items.
    UpdateDropdown(result.results, 5, search);
  });
}

// Function: Update Dropdown
/**
 * Updates the search dropdown with movie results.
 *
 * @param {array} Results - An array of movie results to display.
 * @param {number} ResultsToDisplay - The number of results to display.
 * @param {string} input - The user's search input for highlighting.
 */
function UpdateDropdown(Results, ResultsToDisplay, input) {
  // Clear all existing dropdown items.
  $('#autoFillDiv').empty();

  for (let i = 0; i < ResultsToDisplay; i++) {
    if (i >= Results.length) {
      return; // Return if Results exceed out Results to Display
    }

    // Get the poster image URL
    let poster = `${TMDB_posterUrl}${Results[i].poster_path}`;
    if (Results[i].poster_path == null) {
      poster = `./assets/images/stock-poster.png`;
      console.log(poster);
    }

    // Create a dropdown item with movie information.
    let dropdownItem = $('<div></div>', {
      class: 'dropdownItem bg-white border rounded autoFill p-1 text-gray-600 text-xl',
      id: Results[i].id,
    })
      .append(
        $('<img>', {
          src: poster,
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

    // Append the dropdown item to the dropdown list
    $('#autoFillDiv').append(dropdownItem);
  }
}

// Function: Highlight Input
/**
 * Highlights text in the dropdown menu based on user input.
 *
 * @param {string} text - The text to be highlighted.
 * @param {string} input - The user's search input.
 * @returns {string} - The text with highlighted matches.
 */
function HighlightInput(text, input) {
  // Use a regular expression to find all occurrences of the input in the text
  const regex = new RegExp(input, 'gi');

  // Wrap all occurrences of the input in a highlight span.
  const highlightedString = text.replace(regex, `<span class="highlight">$&</span>`);

  return highlightedString;
}

// Function: Query Results
/**
 * Queries the database for search results based on user input.
 *
 * @param {string} input - The user's search input.
 * @returns {Promise<object>} - A promise that resolves to an object with search results.
 * @throws {Error} - Throws an error if there's an issue with the request.
 */
async function QueryResults(input) {
  // Construct the URL for database query.
  let URL = `${TMDB_url}${TMDB_movieEndpoint}?api_key=${TMDB_key}&query=${input}`;
  try {
    // Fetch and parse data from the database using the URL.
    const jsonData = await GetApiJson(URL, ourOptions);

    //Return the data as search results.
    return jsonData;
  } catch (error) {
    // Handle errors here, such as network issues or invalid input.
    console.error('Error:', error);

    //Throw the error for higher-level handling.
    throw error;
  }
}

// Function: Load Movie Page
/**
 * Loads a movie page based on users selection and changes to movie page.
 *
 * @param {event} e - The event object triggered by the user's selection.
 */
function LoadMoviePage(e) {
  let item = $(e.target);

  //Handle clicking children.
  if (!$(e.target).hasClass('dropdownItem')) {
    item = $(e.target).closest('.dropdownItem');
  }

  //Change Page based on ID of the target.
  ChangePage('movie', item.attr('id'));
}

// Function: Change Page
/**
 * Changes the current web page to the specified page and, if applicable, passes a reference.
 *
 * @param {string} page - The page to navigate to ('movie' or 'library').
 * @param {string} ref - An optional reference value for the 'movie' page. Use an empty string for other pages.
 */
function ChangePage(page, ref) {
  // Get the current page's URL and remove the last part (e.g., http://listyflix.com/homepage > http://listyflix.com).
  let oldLocation = window.location.pathname.split('/');
  oldLocation.pop();
  let newLocation;

  // Determain the new URL based on the specified page.
  switch (page) {
    case 'movie': {
      // If navigating to the movie page, inclide the 'ref' parameter in the URL.
      newLocation = `${oldLocation.join('/')}/pages/movie.html?ref=${ref}`;
      break;
    }
    case 'library': {
      newLocation = `${oldLocation.join('/')}/pages/library.html`;
      break;
    }
  }

  //Change the current page to the new URL.
  window.location.href = newLocation;
}

// Function: Initialize Splide
/**
 * Initializes the Splide carousel with the specified slide count and configuration.
 *
 * @param {number} count - The number of slides to display in the carousel.
 */
function InitilizeSplide(count) {
  // Destroy the previous Splide instance if it exists.
  if (splide) {
    splide.options.perPage = splideCount;
    splide.destroy(true);
  }

  // Create a new Splide instance with the specified configuration.
  splide = new Splide('.splide', {
    type: 'loop',
    perPage: count,
    focus: 'center',
    wheel: true,
    wheelSleep: '100',
    keyboard: true,
    autoplay: true,
    autoplayOptions: {
      start: 'center',
      pauseOnHover: false,
      waitForTransition: true,
    },
    autoplaySpeed: 2000,
  });

  splide.mount();
  UpdateSlideBackground();

  // Update splide background when the carousel is moved.
  splide.on('moved', function () {
    UpdateSlideBackground();
  });

  //Scale the carousel when the window is resized.
  $(window).on('resize', ScaleSplide);
}

// Function: Update Slide Background
/**
 * Updates the background image of the carousel based on the current slide.
 */
function UpdateSlideBackground() {
  let currentSlideIndex = splide.index;
  let currentSlideElement = splide.Components.Elements.slides[currentSlideIndex];

  // Set the background image source based on the current slide.
  $('#backdrop').attr('src', `${$(currentSlideElement).find('img').data('backdrop')}`);
}

//==================================================================================
