$(document).ready(function () {
	bindCSRF();
	winResize();
	winScroll();
	bindAOS();
	onready();
	bindPjax();
	bindGallery();
	bindHovers();
	doSlick();
});

$(window).resize(function () {
	winResize();
});
$(window).scroll(function () {
	winScroll();
});

function preventDefault(event) {
	event = event || window.event;
	event.preventDefault = event.preventDefault || function () { this.returnValue = false }
	event.returnValue = false;
	event.stopImmediatePropagation();
	this.returnValue = false;
}

function popup(title, descr) {
	$('#modal_title').html(title);
	$('#modal_body').html(descr);
	$('#all_modal').modal('show');
	bindForms();
}

function popupTpl(tpl, button, params) {
	if (button) {
		formPreloader($(button), 1);
	}
	$.post('/action/tpl', { tpl: tpl, params: params }, function (data) {
		popup(data.title, data.descr);
		if (button) {
			formPreloader($(button), 0);
		}
	}, 'json');
}

function winResize() {
	setSquare();
	setParentSize();
	maxParentWidth();
	stickTop();
	mto('winResize1000', function () {
		setGalleryWidgetSize();
	}, 1000);
}

function winScroll() {
	stickTop();
}

function maxParentWidth() {
	$('.max-parent-width').each(function () {
		$(this).width(0);
		$(this).width($(this).parent().width());
	});
}

function stickTop() {
	$('.stick-top').each(function () {
		if ($('.stick-handler:visible').length) {
			var custom_offset = $(this).data('offset');
			if (!custom_offset) {
				custom_offset = 0;
			}
			if (($(this).offset().top - custom_offset) < $(window).scrollTop()) {
				$(this).find('.stick-top-content').css('margin-top', $(window).scrollTop() - $(this).offset().top + custom_offset);
			}
		} else {
			$(this).find('.stick-top-content').css('margin-top', 0);
		}
	});
}

function winOpen(url, name, popupOptions) {
	var popupFeatureParts = [];
	for (var propName in popupOptions) {
		if (popupOptions.hasOwnProperty(propName)) {
			popupFeatureParts.push(propName + '=' + popupOptions[propName]);
		}
	}
	var popupFeature = popupFeatureParts.join(',');
	window.open(url, name, popupFeature);
}

function kScrollTo(el, offset, duration) {
	if (!offset) {
		offset = 0;
	}
	var scrollTop = el.offset().top + offset;
	if ($(window).scrollTop() != scrollTop) {
		kScroll(scrollTop, duration);
	}
}

function kScroll(scrollTop, duration, func) {
	if (!duration) duration = Math.round(Math.sqrt(Math.abs($(window).scrollTop() - scrollTop)) * 50);
	if (!func) { func = function () { }; }
	var body = $("html, body");
	body.stop().animate({ scrollTop: scrollTop }, duration, 'swing', function () {
		func();
	});
}

function bindAOS() {
	AOS.init({
		mirror: false,
		//easing: 'ease-out',
		offset: 0
	});
}

function onready() {
	$('[data-onready]').each(function () {
		eval($(this).data('onready'));
	});
}

function pjaxReload(id) {
	$.pjax.reload({ container: '#' + id }).done(function () {
		if ($('#' + id).data('pjax-reload-function')) {
			eval($('#' + id).data('pjax-reload-function'));
		}
	});
}

function bindPjax() {
	if (typeof ($.pjax) != 'undefined') {
		$.pjax.defaults.timeout = 30000;
	}
	$('[data-pjax-reload-every]').each(function () {
		var obj = $(this);
		setInterval(function () {
			pjaxReload(obj.attr('id'));
		}, $(this).data('pjax-reload-every'));
	});
}

function exists(obj, levels) {
	var args = levels.split('.');

	for (var i = 0; i < args.length; i++) {
		if (!obj || !obj.hasOwnProperty(args[i])) {
			return false;
		}
		obj = obj[args[i]];
	}
	return true;
}

function lang_url(url) {
	if (url.indexOf('//') == -1) {
		if (url.substr(0, 1) != '/') {
			url = '/' + url;
		}
		if (url.indexOf(matrix.ajax_pre_url) !== 0) {
			url = matrix.ajax_pre_url + url;
		}
	}
	return url;
}

function bindCSRF() {
	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
		options.url = lang_url(options.url);

		// do not send data for POST/PUT/DELETE
		if (typeof originalOptions.data != 'undefined' && typeof originalOptions.data._pjax != 'undefined') {
			delete (originalOptions.data._pjax);
		}
		if (typeof options.data == 'string' && options.data.indexOf('_pjax') != -1) {
			options.data = '';
		}
		if (originalOptions.type == 'GET' || options.type == 'GET' || originalOptions.type == 'get' || options.type == 'get') {
			return;
		}
		var name = $('meta[name="csrf-param"]').attr('content');
		var value = $('meta[name="csrf-token"]').attr('content');
		var csrf = {};
		csrf[name] = value;
		var data = originalOptions.data;
		if (typeof data == 'string') {
			data = $.unparam(decodeURIComponent(data));
		}
		if (typeof options.data == 'string') {
			options.data = $.param($.extend(data, csrf));
		} else {
			options.data = $.extend(options.data, csrf);
		}
	});
	$(document).ajaxComplete(function () {

	});
}

function modal_close() {
	$('#all_modal').modal('hide');
}

function disableScroll() {
	$('body').addClass('unscroll');
}

function enableScroll() {
	$('body').removeClass('unscroll');
}

var masonry_parms = {
	itemSelector: '.grid-item',
	columnWidth: '.grid-sizer',
	percentPosition: true,
	gutter: 0,
	transitionDuration: '0s',
};
/*
function bindGallery() {
	var $grid = $('.gallery-wrapper.masonry');
	$grid.data('grid', $grid);
	$grid.imagesLoaded().always(function () {
		setGalleryWidgetSize();
		masonry_rebuild();
		$grid.addClass('vis');
		if ($grid.prev().hasClass('pre-masonry')) {
			$grid.prev().removeClass('vis');
		}
		setGalleryWidgetSize();
	});

	var lazyLoadInstance = new LazyLoad({
		callback_loaded: function (el) {
			masonry_rebuild();
		}
	});
}
*/
function bindGallery() {
	var $grid = $('.gallery-wrapper.masonry');
	$grid.data('grid', $grid);
	$grid.imagesLoaded().always(function () {
		setGalleryWidgetSize();
		//mto('masonry');
		masonry_rebuild();
		$grid.masonry(masonry_parms);
		$grid.addClass('vis');
		if ($grid.prev().hasClass('pre-masonry')) {
			$grid.prev().removeClass('vis');
		}
		setGalleryWidgetSize();
		masonry_rebuild();
	});
	masonry_rebuild();
	
	var lazyLoadInstance = new LazyLoad({
		callback_loaded: function (el) {
			masonry_rebuild();
		}
	});
}

function setGalleryWidgetSize() {
	$('.gallery_one').each(function () {
		$(this).css({ 'min-height': 0 });
		$(this).find('.tit').css({ 'min-height': 0 });
		$(this).find('img').show();
		var height = $(this).find('img').height();
		height = $(this).width();
		$(this).find('img').hide();
		$(this).css({ 'min-height': height });
		$(this).find('.tit').css({ 'min-height': height });
	});
	/*mto('new_masonry', function(){
		$('.masonry').masonry();
		mto('new_masonry_vis', function(){
			$('.masonry').addClass('vis');
		},300);
	}, 300);*/
	masonry_rebuild();
}

function masonry_rebuild() {
	mto('masonry_rebuild', function () {
		var $grid = $('.gallery-wrapper.masonry');
		$grid.each(function () {
			$(this).masonry(masonry_parms);
		});
	}, 20);
}

function mto(type, func, to) {//matrix timeout
	clearTimeout(matrix.to[type]);
	matrix.to[type] = setTimeout(function () {
		func();
	}, to);
}

function setSquare() {
	$('.square').each(function () {
		$(this).height($(this).width());
	});
	$('.p4-3').each(function () {
		var w = $(this).width();
		var h = $(this).height();
		if (matrix.window.width != w && matrix.window.height != h) {
			this.style.setProperty('height', Math.round(w / 4 * 3) + 'px', 'important');
		}
	});
	$('.p16-9').each(function () {
		var w = $(this).width();
		var h = $(this).height();
		if (matrix.window.width != w && matrix.window.height != h) {
			this.style.setProperty('height', Math.round(w / 16 * 9) + 'px', 'important');
		}
	});
	$('.p18-9').each(function () {
		var w = $(this).width();
		var h = $(this).height();
		if (matrix.window.width != w && matrix.window.height != h) {
			this.style.setProperty('height', Math.round(w / 18 * 9) + 'px', 'important');
		}
	});
}

function bindHovers() {
	$('[data-style-mouseenter]').mouseenter(function () {
		$(this).css($(this).data('style-mouseenter'));
	});

	$('[data-style-mouseleave]').mouseleave(function () {
		$(this).css($(this).data('style-mouseleave'));
	});
}

function uniqueId(el) {
	var id_prefix = 'unique-id-';
	if (!$(el).attr('id')) {
		if (!matrix.unique_id) {
			matrix.unique_id = 0;
		}
		matrix.unique_id++;
		$(el).attr('id', id_prefix + matrix.unique_id);
	}
}

function captchaLoad() {
	if ($('.g-recaptcha').length) {
		$('.g-recaptcha').each(function () {
			$(this).find('div:first').addClass('parentSize');
		});
	}
	winResize();
}
function setParentSize() {
	$('.parentSize').each(function () {
		if ($(this).width() > $(this).parent().width()) {
			$(this).css('transform', 'scale(' + ($(this).parent().width() / $(this).width()) + ')');
		}
	});
	var vw = $(window).width();
	$('.mobile-center-parent-x').each(function () {
		var ml = 0;
		if (vw <= 992) {
			var par = $(this).parent();
			ml = - $(this).width() / 2
		}
		$(this).css('margin-left', ml);
	});
}

function doSlick() {
	$('.doSlick').each(function () {
		var $grid = $(this);
		var slickParams = {
			variableWidth: false,
			slidesToShow: 4,
			slidesToScroll: 4,
			infinite: false,
			responsive: [
				/*
				{
					breakpoint: 992,
					settings: {
						slidesToShow: 3,
						slidesToScroll: 3,
					}
				},
				*/
				{
					breakpoint: 464,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1,
					}
				},
			]
		};

		if ($(this).data('slick')) {
			slickParams = $.merge(slickParams, $(this).data('slick'));
		}

		$grid.imagesLoaded().always(function () {
			try {
				$grid.slick(slickParams);
			}
			catch (error) {
			}
		});
	});

}
