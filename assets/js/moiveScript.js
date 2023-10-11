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

let id = '';

//===============================================================================
//=============================== Running Logic =================================
//===============================================================================

//Run when the document is done loading
$(document).ready(function () {
  SetID();
  LoadMoviePage();
});

function SetID() {
  let url = window.location.href;
  args = url.split('?');
  ref = args[1].split('=');
  id = ref[1];
}

//This function is used to get our recommendations
//Input How many movies we want to get
//returns a random array of movieData
function LoadMoviePage() {
  const posterUrl = `https://image.tmdb.org/t/p/original/`;

  console.log(id);
  let movieUrl = `${TMDB_url}/movie/${id}?api_key=${TMDB_key}`;
  console.log(movieUrl);

  return GetApiJson(movieUrl, ourOptions).then((jsonData) => {
    //Handle Certification
    GetCertification()
      .then((certification) => {
        console.log(certification.certification);
        $('#certification').text(certification.certification);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    console.log(jsonData); //Main Object$()
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

    $('#rating').text(
      `${Number(jsonData.vote_average.toFixed(1))}/10 - ${
        jsonData.vote_count
      } votes`
    );

    $('#runtime').text(`${jsonData.runtime} mins`);

    console.log(jsonData.genres.length); //genre of movie - multiple genres
    let genreDisplay = $('#genre').children();
    for (let i = 0; i < genreDisplay.length; i++) {
      if (i < jsonData.genres.length) {
        console.log(jsonData.genres[i].name);
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
        console.log(credits);
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
  });
}

//This function is used to get most recent movie certification from another fetch call
//Input Movie ID
//returns String containing most recent rating
async function GetCertification() {
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
