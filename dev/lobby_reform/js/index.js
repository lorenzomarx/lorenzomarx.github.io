$(document).ready(function () {
    // Lightbox for the #share-kit poster wall.
    // Uses Fancybox 2.1.5 (loaded in index.html). Each tile has
    // data-fancybox="share" + href to the full-res PNG.
    $('[data-fancybox="share"]').fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: { title: { type: 'inside' } }
    });

    // Prevent the SAVE download chip from also triggering the lightbox
    // when it overlaps the image link's tap area on touch devices.
    $('.share-download').on('click', function (e) {
        e.stopPropagation();
    });

    // "Download all four posters" — fire a sequenced click on every
    // .share-download anchor so the browser saves all four PNGs.
    $('#share-download-all').on('click', function () {
        var links = $('.share-card .share-download').get();
        links.forEach(function (a, i) {
            setTimeout(function () { a.click(); }, i * 250);
        });
    });
});
