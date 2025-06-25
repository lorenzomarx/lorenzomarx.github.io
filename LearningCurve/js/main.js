$(document).ready(function(){
  //FANCYBOX
  //https://github.com/fancyapps/fancyBox
  $(".fancybox").fancybox({
      openEffect: "none",
      closeEffect: "none"
  });


  //------------------------------------//
  //Navbar//
  //------------------------------------//
    	var menu = $('.navbar');
    	$(window).bind('scroll', function(e){
    		if($(window).scrollTop() > 140){
    			if(!menu.hasClass('open')){
    				menu.addClass('open');
    			}
    		}else{
    			if(menu.hasClass('open')){
    				menu.removeClass('open');
    			}
    		}
    	});

  // Close mobile menu when clicking outside
  $(document).click(function(e) {
    if (!$(e.target).closest('.navbar-collapse').length && !$(e.target).closest('.navbar-toggle').length) {
      $('.navbar-collapse').collapse('hide');
    }
  });

  // Close mobile menu when clicking a link
  $('.navbar-nav>li>a').click(function(){
    $('.navbar-collapse').collapse('hide');
  });

  //------------------------------------//
  //Scroll To//
  //------------------------------------//
  $(".scroll").click(function(event){
  	event.preventDefault();
  	$('html,body').animate({scrollTop:$(this.hash).offset().top}, 800);

  });

  //------------------------------------//
  //Wow Animation//
  //------------------------------------//
  wow = new WOW(
        {
          boxClass:     'wow',      // animated element css class (default is wow)
          animateClass: 'animated', // animation css class (default is animated)
          offset:       0,          // distance to the element when triggering the animation (default is 0)
          mobile:       false        // trigger animations on mobile devices (true is default)
        }
      );
      wow.init();

  // Navbar scroll behavior
  var lastScrollTop = 0;
  var navbar = $('.navbar');
  var scrollThreshold = 100; // Adjust this value to change when the navbar appears

  $(window).scroll(function() {
    var scrollTop = $(this).scrollTop();

    if (scrollTop > scrollThreshold) {
      navbar.addClass('visible');
    } else {
      navbar.removeClass('visible');
    }

    lastScrollTop = scrollTop;
  });

  // Smooth scrolling for all links
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
      }
    }
  });
});
