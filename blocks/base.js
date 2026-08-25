// TOOLS ======
$(document).ready(function () {

	if ($('.main-header .FH').length){
		// BASE MENU
		$('ul.base-menu').show();
	};

	// LEVEL DEPTH FOR MOBILE
	if($(window).width() < 1090) {
		var fullMenu = '';
		$('ul.base-menu li.ifDrop').each(function(){
			fullMenu = fullMenu + '<li class="hidden-desk">'+$(this).html()+'</li>';
		});
		$('ul.base-menu li.all-product-button').remove();
		$('.nav-menu.base-menu').prepend(fullMenu);
	}

	// FIXED HEADER
	function fixNav(){
		if (!$('.cart-menu').length && !$('.-g-template-black-friday').length){
			var nav = $('.main-header');
			var pos = nav.height();
			var posDelay = nav.height()*2;
			var prevScroll = 0;

			nav.addClass('fix-nav');

			$(window).on('scroll', function () {
				var fix = ($(this).scrollTop() > posDelay) ? true : false;
				if(fix){
					nav.addClass('fade-menu', fix);
					setTimeout(function() {
						nav.addClass('animate-menu');
					}, 250);
					$('body').css('margin-top', pos);
					if($(this).scrollTop() > prevScroll){
						nav.removeClass('active-menu');
					}else{
						nav.addClass('active-menu');
					}
				}else{
					$('body').css('margin-top', 0);
					nav.removeClass('fade-menu active-menu animate-menu', fix);
				}
				prevScroll = $(this).scrollTop();
			});
		}
	}
	$.Gomag.bind('Widget/Add/After', function(){
		fixNav();

		// BF SIDEBAR + MENU STICKY
		if($('.-g-template-black-friday').length){
		$('.main-header').css({'top' : '-' + ($('.discount-tape').height() + $('.top-head-bg').height()) + 'px'});
		}
		if($( window ).width() > 991 && $('.-g-template-black-friday').length){
			$('.landing-h .side-menu.fixed').css({'top' : $('#navigation').outerHeight() + 20 + 'px'});
		}
	})

	// ITC MENU  ==========
	function buildMenu(){
		$('.main-header .__ignoreSubmenu').each(function() {
			var $this = $(this);
			if ($this.find('li').length > 20){
				$this.addClass('col3');
			}else if ($this.find('li').length >= 11){
				$this.addClass('col2');
			}else if ($this.find('li').length < 10){
				$this.addClass('col1');
			}else{}
		});
	};
	buildMenu();

	$('.main-header .menu-drop').on('mouseenter', function() {
		$(this).find('.menu-dd').addClass('visible');

		if ( $('.slide-item-menu').length ) {
			$('.slide-item-menu').owlCarousel({items:1,navigation:!0,pagination:!1});
			var owl = $('.slide-item-menu'); // get owl element
			var owlInstance = owl.data('owlCarousel'); // get owl instance from element
			if(owlInstance != null) // if instance is existing
			owlInstance.reinit();
			$.Gomag.eqProductRow();
		};
	}).on('mouseleave', function() {
		$(this).find('.menu-dd').removeClass('visible');
	});

	$('.main-header ul.nav-menu li.ifDrop').has('ul.drop-list').addClass('drop-parent');

	$('.main-header .drop-parent').on('mouseenter', function() {
		$(this).find('.drop-list').addClass('visible');
		$(this).find('.drop-list').show();
		var itemNumber = $(this).find('.col').length,
			itemWidth = $(this).find('.col').outerWidth(),
			elemCount = $(this).find('.drop-list li a').length,
			imgCount = $(this).find('.drop-list .image').length;

			$('.menu-dd').css({"padding-right" : "15px", "width" : ((elemCount < 10 && imgCount == 0) ? itemWidth + 15 : itemNumber * itemWidth + 15) + 255 + "px"});

	}).on('mouseleave', function() {
		$(this).find('.drop-list').removeClass('visible');
		$(this).find('.drop-list').hide();
		$('.menu-dd').css({"width" : 255 + "px"});
	})

});

try {
