var burst = new mojs.Burst({
  left: 0, top: 0,
  radius: { 4: 32 },
  angle: 45,
  count: 14,
  children: {
    radius: 2.5,
    fill: '#FD7932',
    scale: { 1: 0, easing: 'quad.in' },
    pathScale: [.8, null],
    degreeShift: [13, null],
    duration: [500, 700],
    easing: 'quint.out'
  }
});

document.addEventListener('click', function (e) {
  var coords = { x: e.pageX, y: e.pageY };
  burst.tune(coords).replay();
});

$('body').on('click', '[data-action="drawer"]', function() {
  $(this).closest('.card').toggleClass("active");
});
