const omdbKey = "git ";

let input = "deadpool";

$(document).ready(function () {
  console.log("Document Ready!");

  let url = `http://www.omdbapi.com/?apikey=${omdbKey}&t=${input}`;
  let ourOptions = {
    method: "GET",
    cache: "reload",
  };
  GetApiJson(url, ourOptions).then((jsonData) => {
    console.log(jsonData);
  });
});
