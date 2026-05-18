// Featured · Random — a random article image (linked to its article) from a
// random Newsly source. If a source returns no image it's skipped and another
// is tried, so the panel is never left blank.
const feeds = [
    "https://lorenzomarx.github.io/newsly/api/aljazApi/aljaz.json",
    "https://lorenzomarx.github.io/newsly/api/ap/ap.json",
    "https://lorenzomarx.github.io/newsly/api/bbcApi/bbc.json",
    "https://lorenzomarx.github.io/newsly/api/bbcSport/bbcsport.json",
    "https://lorenzomarx.github.io/newsly/api/bloomberg/bloomberg.json",
    "https://lorenzomarx.github.io/newsly/api/breaking_us/breaking_us.json",
    "https://lorenzomarx.github.io/newsly/api/cnn/cnn.json",
    "https://lorenzomarx.github.io/newsly/api/huffington/huff.json",
    "https://lorenzomarx.github.io/newsly/api/techradar/techradar.json",
    "https://lorenzomarx.github.io/newsly/api/vice/vice.json",
    "https://lorenzomarx.github.io/newsly/api/washpost/washpost.json",
    "https://lorenzomarx.github.io/newsly/api/wired/wired.json",
];

function setup() {
    noCanvas();
    tryFeeds(shuffle(feeds));
}

function tryFeeds(queue) {
    if (!queue.length) {
        showError();
        return;
    }
    loadJSON(
        queue[0],
        data => {
            const withImages = (((data && data.articles) || [])
                .filter(a => a && a.urlToImage));
            if (!withImages.length) {
                tryFeeds(queue.slice(1));
                return;
            }
            const pick = random(withImages);
            const img = createImg(pick.urlToImage, pick.title || "Featured article");
            if (pick.url) {
                const link = createA(pick.url, "", "_blank");
                link.attribute("rel", "noopener");
                link.parent("result");
                img.parent(link);
            } else {
                img.parent("result");
            }
        },
        () => tryFeeds(queue.slice(1))
    );
}

function showError() {
    const p = createP("Feed unavailable. Try refresh.");
    p.parent('result');
    p.addClass('error-message');
}
