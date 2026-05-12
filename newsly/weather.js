const urlNews = "https://lorenzomarx.github.io/newsly/api/aljazApi/aljaz.json";

function setup() {
    noCanvas();
    loadJSON(urlNews, gotData, showError);
}

function gotData(data) {
    const articles = (data && data.articles) || [];
    if (!articles.length) {
        showError();
        return;
    }
    const pick = articles[floor(random(articles.length))];
    if (!pick.urlToImage) {
        showError();
        return;
    }
    const img = createImg(pick.urlToImage, pick.title || "Featured article");
    img.parent('result');
}

function showError() {
    const p = createP("Feed unavailable. Try refresh.");
    p.parent('result');
    p.addClass('error-message');
}
