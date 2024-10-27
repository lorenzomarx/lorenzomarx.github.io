let urlNews = "https://lorenzomarx.github.io/newsly/api/aljazApi/aljaz.json";

function setup() {
  noCanvas();

  // Load JSON data and process it
  loadJSON(urlNews, gotData, showError);
}

function gotData(data) {
  console.log(data.articles);
  let articles = data.articles;

  // Choose a random article
  let randomIndex = floor(random(articles.length));
  let randomArticle = articles[randomIndex];

  // Create an image element for the randomly selected article
  let image = createImg(randomArticle.urlToImage, "Random Article Image");
  image.addClass('img-fluid z-depth-3 p-3 flex-1');
  image.parent('result');
}


// Error handling function for loadJSON
function showError() {
  createP("Failed to load data. Please try again later.").parent('result').addClass('error-message');
}
