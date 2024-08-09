$(document).ready(function() {
     $("#personal").addClass("animated slideInUp");
     $(".principle").addClass("animated slideInUp");
     $(".work").addClass("animated slideInUp");
     $('.parallax').parallax();
});
$.extend($.scrollTo.defaults, {
     duration: 800,
});
$('#navpersonal').click(function() {
     $.scrollTo('#head');
});

$('#navwork').click(function() {
     $.scrollTo('#work');
});