//===============================================================================
//============================= Moviepage Variables =============================
//===============================================================================

let id = ''; // ID for movie page.

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

// Run when the document is fully loaded.
$(document).ready(function () {
  // Initialize the page by setting the movie ID.
  SetID();

  // Load the selected movie on the page.
  LoadMoviePage();

  // Attach Event Listeners.
  $('#addWatchlist').on('click', AddMovieToWatchlist);
  $(`#autoFillDiv`).on('click', LoadMoviePage);
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================

// Function: Set ID
/**
 * Extracts the ID from the URL and stores it in the 'id' variable.
 */
function SetID() {
  let url = window.location.href;
  args = url.split('?');
  ref = args[1].split('=');
  id = ref[1];
}

// Function: Load Movie Page
/**
 * Loads and populates the movie page with details from TMDB API.
 */
function LoadMoviePage() {
  // Construct the URL for fetching movie data from TMDB.
  let movieUrl = `${TMDB_url}/movie/${id}?api_key=${TMDB_key}`;

  return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
    // Handle Getting Certification
    GetCertification()
      .then((certification) => {
        // Update certification information on the page.
        $('#certification').text(certification.certification);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // Update the poster image and background image on the page.
    $('#poster').attr('src', `${TMDB_posterUrl}${jsonData.poster_path}`);
    $('.target-bg').css({
      background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)),url(${TMDB_posterUrl}${jsonData.backdrop_path})`,
      'background-position': 'center',
      'background-size': 'cover',
    });

    // Update movie title, release date, overview, rating, runtime, and tagline.
    $('#title').text(jsonData.title);
    $('#release-date').text(`Released: ${jsonData.release_date}`);
    $('#overview').text(jsonData.overview);
    $('#rating').text(`${Number(jsonData.vote_average.toFixed(1))}/10 - ${jsonData.vote_count} votes`);
    $('#runtime').text(`${jsonData.runtime} mins`);
    $('#tagline').text(jsonData.tagline);

    // Update genre information on the page.
    let genreDisplay = $('#genre').children();
    for (let i = 0; i < genreDisplay.length; i++) {
      if (i < jsonData.genres.length) {
        $(genreDisplay[i]).text(jsonData.genres[i].name);
      } else {
        $(genreDisplay[i]).text('X');
        $(genreDisplay[i]).hide();
      }
    }

    //Update featuring actors and directors on the page.
    GetCredits()
      .then((credits) => {
        let featuringEl = $('#cast').children().eq(1);
        let featuringList = credits.cast.slice(0, 5);
        let featuringListArray = featuringList.map((item) => item.name);
        featuringEl.text(`Featuring: ${featuringListArray.join(', ')}`);

        let directorEl = $('#cast').children().eq(0);
        let director = credits.crew.filter((item) => item.job === 'Director');
        let directorArray = director.map((item) => item.name);
        directorEl.text(`Director: ${directorArray.join(', ')}`);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    //Check if the movie is in the watchlist and toggle the watchlist button.
    movies = GetData('WatchList');
    if (movies == null) {
      movies = [];
    }

    if (movies.includes(id)) {
      WatchlistButtonToggle(false);
    } else {
      WatchlistButtonToggle(true);
    }

    // Display Streaming availability if applicable.
    if (toggleStreamAvalability) {
      DisplayStreamingAvalabilty();
    }
  });
}

// Function: Watchlist Button Toggle
/**
 * Toggle the text of the watchlist button based on the provided status.
 * @param {boolean} status - True to display "Add to Watchlist," false to display "Remove from Watchlist."
 */
function WatchlistButtonToggle(status) {
  if (status) {
    $('#addWatchlist').text('+ To Watchlist');
  } else {
    $('#addWatchlist').text('- From Watchlist');
  }
}

// Function: Get Certification
/**
 * Fetches the most recent movie certification for a given movie ID from TMDB.
 * @param {number} id - The movie ID for which to retrieve certification.
 * @returns {string} - A string containing the most recent rating or 'N/A' if not available.
 */
async function GetCertification() {
  // Construct the URL for fetching certification data.
  let certificationUrl = `${TMDB_url}/movie/${id}/release_dates?api_key=${TMDB_key}`;

  try {
    // Fetch certification data from TMDB.
    const certificationData = await GetApiJson(certificationUrl, ourOptions);

    // Find the US certification data among the results.
    const usCertification = await certificationData.results.find((result) => result.iso_3166_1 === 'US');

    if (usCertification && usCertification.release_dates.length > 0) {
      // Get the latest certification entry from the list.
      const latestCertification = usCertification.release_dates[usCertification.release_dates.length - 1];
      return latestCertification;
    } else {
      // Return 'N/A' if no certification data is avalible for the US.
      return `N/A`;
    }
  } catch (error) {
    // Handle and log any errors that occur during the fetch.
    console.error('Error fetching certification data:', error);
    throw error;
  }
}

// Function: Get Credits
/**
 * Fetches credits data for a given movie ID from the TMDB API.
 * @returns {object} - An object containing cast and crew credits information.
 */
async function GetCredits() {
  // Construct URL for fetching credits
  let creditUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_key}`;
  try {
    // Fetch credits from TMDB.
    const creditData = await GetApiJson(creditUrl, ourOptions);
    return creditData;
  } catch (error) {
    // Handle and log any errors that occur during the fetch.
    console.error('Error fetching certification data:', error);
    throw error;
  }
}

// Function: Add Movie To Watchlist
/**
 * Adds or removes a movie from the watchlist.
 * @param {event} e - The event object triggered by the user's action.
 */
function AddMovieToWatchlist(e) {
  // Retrive the current watchlist data from local storage.
  let watchlist = GetData('WatchList');

  // If the watchlist data is null, set watchlist to an empty array.
  if (watchlist == null) {
    watchlist = [];
  }

  // Check if movie already exists in watchlist and remove it if found.
  for (let i = 0; i < watchlist.length; i++) {
    if (watchlist[i] === id) {
      watchlist.splice(i, 1);
    }
  }

  // Toggle the watchlist button and add or remove the movie ID accordingly.
  if ($(this).text() == '- From Watchlist') {
    WatchlistButtonToggle(true);
  } else {
    WatchlistButtonToggle(false);

    watchlist.unshift(id);
  }

  //Update the watchlist data in local storage.
  SetData('WatchList', watchlist);
}

// Function: Display Streaming Availability
/**
 * Fetches and displays streaming availability information for the current movie.
 * @returns {Promise<void>} - A Promise that resolves once the data is fetched and displayed.
 */
async function DisplayStreamingAvalabilty() {
  // Construct the URL for (SA).
  const url = `${SA_url}&tmdb_id=movie/${id}`;

  // Initilize an empty array to store streaming information.
  let streamingInfo = [];

  // Fetch streaming avalability data from (SA).
  let streamingData = await GetApiJson(url, SA_options);

  // Check if streaming data is avalable and extract US streaming info.
  if (!streamingData) {
    streamingData = [];
  } else {
    if (streamingData.result.streamingInfo.us) {
      streamingInfo = streamingData.result.streamingInfo.us;
    }
  }

  let found = [];
  let sortedInfo = [];

  // Filter and sort streaming information
  for (const info of streamingInfo) {
    if (info.streamingType == 'subscription' && !found.includes(info.service)) {
      found.push(info.service);
      sortedInfo.push(info);
    }
  }
  for (const info of streamingInfo) {
    if (info.streamingType == 'rent' && !found.includes(info.service)) {
      found.push(info.service);
      sortedInfo.push(info);
    }
  }

  // Display the streaming information
  if (sortedInfo.length > 0) {
    for (const service of sortedInfo) {
      $('#stream').append(
        $(`<a></a>`, {
          id: service.service,
          href: service.link,
          target: 'blank',
        })
      );

      // Display the streaming service's logo.
      console.log(streamingServices.services[service.service].images.darkThemeImage);
      $(`#${service.service}`).append(
        $('<img>', {
          src: streamingServices.services[service.service].images.darkThemeImage,
          class: 'm-4 md:h-16 h-8',
        })
      );
    }
  } else {
    // Display a message when the movie is not avalible for streaming.
    $('#stream').append(
      $(`<p></p>`, {
        text: 'Not avalible to stream',
        class: 'text-white bg-red-500 opacity-75 rounded-full p-1 px-5 text-xl mt-4',
      })
    );
  }
}

//===============================================================================
//================================= Streaming Data ==============================
//===============================================================================

// Stores data and images for various streaming services.
const streamingServices = {
  countryCode: 'us',
  name: 'United States',
  services: {
    apple: {
      id: 'apple',
      name: 'Apple TV',
      homePage: 'https://tv.apple.com/',
      themeColorCode: '#000000',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/apple/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/apple/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/apple/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: true,
        buy: true,
        free: false,
        rent: true,
        subscription: true,
      },
    },
    britbox: {
      id: 'britbox',
      name: 'BritBox',
      homePage: 'https://www.britbox.com/us',
      themeColorCode: '#4ba0b8',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/britbox/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/britbox/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/britbox/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
      addons: {},
    },
    curiosity: {
      id: 'curiosity',
      name: 'Curiosity Stream',
      homePage: 'https://curiositystream.com/',
      themeColorCode: '#eea83d',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/curiosity/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/curiosity/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/curiosity/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    disney: {
      id: 'disney',
      name: 'Disney+',
      homePage: 'https://www.disneyplus.com/',
      themeColorCode: '#01137c',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/disney/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/disney/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/disney/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    hbo: {
      id: 'hbo',
      name: 'Max',
      homePage: 'https://play.max.com/',
      themeColorCode: '#002be7',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/max/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/max/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/max/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    hulu: {
      id: 'hulu',
      name: 'Hulu',
      homePage: 'https://www.hulu.com',
      themeColorCode: '#1ce783',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/hulu/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/hulu/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: true,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
      cinemax: {
        id: 'cinemax',
        displayName: 'Cinemax',
        homePage: 'https://www.hulu.com/network/cinemax-e53daca2-6aed-48b8-8d73-e87cc3ccc5b3',
        themeColorCode: '#010101',
        image: 'https://media.movieofthenight.com/services/hulu/us/addons/cinemax.png',
      },
      max: {
        id: 'max',
        displayName: 'Max',
        homePage: 'https://www.hulu.com/network/hbo-max-1b3523c1-3090-4c27-a1e8-a04d33867c34',
        themeColorCode: '#002be7',
        image: 'https://media.movieofthenight.com/services/hulu/us/addons/max.png',
      },
      showtime: {
        id: 'showtime',
        displayName: 'Showtime',
        homePage: 'https://www.hulu.com/network/showtime-f160e912-83eb-4bea-b6f6-a7fddc103757',
        themeColorCode: '#ff1f2c',
        image: 'https://media.movieofthenight.com/services/hulu/us/addons/showtime.png',
      },
      starz: {
        id: 'starz',
        displayName: 'Starz',
        homePage:
          'https://img2.hulu.com/user/v3/editorial/281?base_image_bucket_name=vogue&base_image=bowie-page_281_1665089557754_title.treatment.horizontal&operations=%5B%7B%22resize%22:%22800x800%7Cmax%22%7D,%7B%22format%22:%22png%22%7D,%7B%22trim%22:%22(0,0,0,0)%22%7D%5D',
        themeColorCode: '#006576',
        image: '',
      },
    },
    mubi: {
      id: 'mubi',
      name: 'Mubi',
      homePage: 'https://mubi.com',
      themeColorCode: '#001588',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/mubi/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/mubi/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/mubi/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    netflix: {
      id: 'netflix',
      name: 'Netflix',
      homePage: 'https://www.netflix.com',
      themeColorCode: '#E50914',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/netflix/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/netflix/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    paramount: {
      id: 'paramount',
      name: 'Paramount+',
      homePage: 'https://www.paramountplus.com',
      themeColorCode: '#0064FF',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/paramount/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/paramount/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: true,
        rent: false,
        subscription: true,
      },
    },
    peacock: {
      id: 'peacock',
      name: 'Peacock',
      homePage: 'https://www.peacocktv.com',
      themeColorCode: '#000000',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/peacock/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/peacock/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: true,
        rent: false,
        subscription: true,
      },
    },
    prime: {
      id: 'prime',
      name: 'Prime Video',
      homePage: 'https://www.amazon.com/gp/video/storefront/',
      themeColorCode: '#00A8E1',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/prime/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/prime/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/prime/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: true,
        buy: true,
        free: false,
        rent: true,
        subscription: true,
      },
    },
    showtime: {
      id: 'showtime',
      name: 'Showtime',
      homePage: 'https://www.sho.com',
      themeColorCode: '#ff1f2c',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/showtime/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/showtime/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/showtime/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    starz: {
      id: 'starz',
      name: 'Starz',
      homePage: 'https://www.starz.com',
      themeColorCode: '#006576',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/starz/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/starz/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/starz/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
    zee5: {
      id: 'zee5',
      name: 'Zee5',
      homePage: 'https://www.zee5.com/global',
      themeColorCode: '#8230c6',
      images: {
        lightThemeImage: 'https://media.movieofthenight.com/services/zee5/logo-light-theme.svg',
        darkThemeImage: 'https://media.movieofthenight.com/services/zee5/logo-dark-theme.svg',
        whiteImage: 'https://media.movieofthenight.com/services/zee5/logo-white.svg',
      },
      supportedStreamingTypes: {
        addon: false,
        buy: false,
        free: false,
        rent: false,
        subscription: true,
      },
    },
  },
};
