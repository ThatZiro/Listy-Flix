//===============================================================================
//================================= Variables ===================================
//===============================================================================
//Remove Debug Messages
const utilities_Logs = false;

//Disable stream avalability api calls
const toggleStreamAvalability = true;

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

let id = '';

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

//Run when the document is done loading
$(document).ready(function () {
  SetID();
  LoadMoviePage();
  $('#addWatchlist').on('click', AddMovieToWatchlist);
  $(`#autoFillDiv`).on('click', LoadMoviePage);

  //Temp Data Clear
  $(document).keydown(function (event) {
    if (event.ctrlKey && event.key === 'c') {
      ClearWatchlist();
    }
  });
});

//===============================================================================
//================================= Functions ===================================
//===============================================================================
function SetID() {
  let url = window.location.href;
  args = url.split('?');
  ref = args[1].split('=');
  id = ref[1];
}

function LoadMoviePage() {
  const posterUrl = `https://image.tmdb.org/t/p/original/`;

  let movieUrl = `${TMDB_url}/movie/${id}?api_key=${TMDB_key}`;

  return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
    //Handle Certification
    GetCertification()
      .then((certification) => {
        $('#certification').text(certification.certification);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    //${posterUrl}${jsonData.backdrop_path}

    //${posterUrl}${jsonData.poster_path}
    $('#poster').attr('src', `${posterUrl}${jsonData.poster_path}`);
    $('.target-bg').css({
      background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)),url(${posterUrl}${jsonData.backdrop_path})`,
      'background-position': 'center',
      'background-size': 'cover',
    });

    $('#title').text(jsonData.title);

    $('#release-date').text(`Released: ${jsonData.release_date}`);

    $('#rating').text(`${Number(jsonData.vote_average.toFixed(1))}/10 - ${jsonData.vote_count} votes`);

    $('#runtime').text(`${jsonData.runtime} mins`);
    let genreDisplay = $('#genre').children();
    for (let i = 0; i < genreDisplay.length; i++) {
      if (i < jsonData.genres.length) {
        $(genreDisplay[i]).text(jsonData.genres[i].name);
      } else {
        $(genreDisplay[i]).text('X');
        $(genreDisplay[i]).hide();
      }
    }

    $('#tagline').text(jsonData.tagline);

    $('#overview').text(jsonData.overview);
    //Handle Certification
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

    movies = GetData('WatchList');
    if (movies == null) {
      movies = [];
    }

    if (movies.includes(id)) {
      WatchlistButtonToggle(false);
    } else {
      WatchlistButtonToggle(true);
    }

    if (toggleStreamAvalability) {
      DisplayStreamingAvalabilty();
    }
  });
}

function WatchlistButtonToggle(status) {
  if (status) {
    $('#addWatchlist').text('+ To Watchlist');
  } else {
    $('#addWatchlist').text('- From Watchlist');
  }
}

//This function is used to get most recent movie certification from another fetch call
//Input Movie ID
//returns String containing most recent rating
async function GetCertification() {
  let certificationUrl = `${TMDB_url}/movie/${id}/release_dates?api_key=${TMDB_key}`;
  // let url = `https://api.themoviedb.org/3/movie/335984/release_dates?api_key=337061be9657573ece2ab40bc5cb0965`;

  try {
    const certificationData = await GetApiJson(certificationUrl, ourOptions);
    const usCertification = await certificationData.results.find((result) => result.iso_3166_1 === 'US');

    if (usCertification && usCertification.release_dates.length > 0) {
      const latestCertification = usCertification.release_dates[usCertification.release_dates.length - 1];
      return latestCertification;
    } else {
      return `N/A`;
    }
  } catch (error) {
    console.error('Error fetching certification data:', error);
    throw error;
  }
}

async function GetCredits() {
  let creditUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_key}`;
  try {
    const creditData = await GetApiJson(creditUrl, ourOptions);
    return creditData;
  } catch (error) {
    console.error('Error fetching certification data:', error);
    throw error;
  }
}

function AddMovieToWatchlist(e) {
  let watchlist = GetData('WatchList');
  if (watchlist == null) {
    watchlist = [];
  }

  for (let i = 0; i < watchlist.length; i++) {
    if (watchlist[i] === id) {
      watchlist.splice(i, 1);
    }
  }

  if ($(this).text() == '- From Watchlist') {
    WatchlistButtonToggle(true);
  } else {
    WatchlistButtonToggle(false);

    watchlist.unshift(id);
  }

  SetData('WatchList', watchlist);
}

function ClearWatchlist() {
  localStorage.removeItem('WatchList');
  alert('ADMIN : Movies Cleared From Local Storage');
}

async function DisplayStreamingAvalabilty() {
  //Fetch Data from API using input
  const SA_url = `https://streaming-availability.p.rapidapi.com/get?output_language=en`;
  const url = `${SA_url}&tmdb_id=movie/${id}`;
  const SA_options = {
    method: 'GET',
    headers: {
      //'X-RapidAPI-Key': '9d900f40famshab4ec5577e22c8bp15bb35jsn4815264ed7b7', // Brandon's key
      'X-RapidAPI-Key': 'e517718793mshc32498728a54ef2p1d6902jsn24ec7261a3d8', // Jared's key
      // 'X-RapidAPI-Key': '0368508b97msh09a48829a6827d0p1ea4b9jsn4b2d070dbc10', // Jorlyna's key
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
    },
  };
  // console.log(url);
  let streamingInfo = [];
  let streamingData = await GetApiJson(url, SA_options);

  if (!streamingData) {
    streamingData = [];
  } else {
    if (streamingData.result.streamingInfo.us) {
      streamingInfo = streamingData.result.streamingInfo.us;
    }
  }

  console.log(streamingData);
  // console.log(streamingData.result.streamingInfo.us);

  let found = [];
  let sortedInfo = [];
  console.log(streamingInfo);
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
  console.log(sortedInfo);

  //Sort Data to limit results? Maybe only include the popular providers (Netflix, hulu, prime, apple etc)
  //For Each Service
  if (sortedInfo.length > 0) {
    for (const service of sortedInfo) {
      $('#stream').append(
        $(`<a></a>`, {
          id: service.service,
          href: service.link,
          target: 'blank',
        })
      );

      console.log(streamingServices.services[service.service].images.darkThemeImage);
      $(`#${service.service}`).append(
        $('<img>', {
          src: streamingServices.services[service.service].images.darkThemeImage,
          class: 'm-4 md:h-16 h-8',
        })
      );
    }
  } else {
    $('#stream').append(
      $(`<p></p>`, {
        text: 'Not avalible to stream',
        class: 'text-white bg-red-500 opacity-75 rounded-full p-1 px-5 text-xl mt-4',
      })
    );
  }

  // --Display Service in Streamhere Div as Ancor and Image
  //If No StreamServices are avalible display "Not available to stream" message
}
//===============================================================================
//================================= Stream Data =================================
//===============================================================================
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
