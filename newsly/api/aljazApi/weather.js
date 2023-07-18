var urlNews = "https://lorenzomarx.github.io/newsly/api/aljazApi/aljaz.json";


function setup() {

 //noCanvas();

 loadJSON(urlNews, gotData);

}

function gotData(data) {
  console.log(data.articles);
  var NY = data.articles;
  for (var i = 0; i < NY.length; i++) {
    //createElement('h3',articles[i].section);
    let author = createElement('h2',NY[i].author);
    author.parent('result');
    let title = createElement('h3',NY[i].title).addClass('card');
    title.parent('result');
    let par = createP(NY[i].description);
    par.parent('result');
    let image = createImg(NY[i].urlToImage).addClass('img-fluid z-depth-3 p-3 flex-1');
    image.parent('result');
    let url = createA(NY[i].url,"Link",'_blank').addClass('btn btn-outline-primary waves-effect');
    url.parent('result');

  }
}
