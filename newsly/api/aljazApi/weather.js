const urlNews = "https://lorenzomarx.github.io/newsly/api/aljazApi/aljaz.json";

function setup() {
    noCanvas();
    loadJSON(urlNews, render, onError);
}

function render(data) {
    const articles = (data && data.articles) || [];
    if (!articles.length) {
        onError();
        return;
    }
    articles.forEach(a => {
        const card = createDiv('').addClass('article-card');
        card.parent('result');
        if (a.author)      createElement('span', a.author).addClass('author').parent(card);
        if (a.title)       createElement('h2', a.title).addClass('title').parent(card);
        if (a.urlToImage)  createImg(a.urlToImage, a.title || '').addClass('news-img').parent(card);
        if (a.description) createElement('p', a.description).addClass('description').parent(card);
        if (a.url)         createA(a.url, 'Read →', '_blank').addClass('read-btn').parent(card);
    });
}

function onError() {
    createP('Feed unavailable. Try again later.').parent('result').addClass('error-message');
}
