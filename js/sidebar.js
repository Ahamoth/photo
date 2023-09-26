$(document).ready(function(){
	$('.sidebarToggle').click(function(){
		$(this).toggleClass('open');
		$('.sidebarSlideWrap').toggleClass('open');
		$('.sidebarToggle').removeClass('unvis');
		$('.sidebarSlide').scrollTop(0);
		if( $('.sidebarSlideWrap').hasClass('open') ){
			disableScroll();
		}else{
			enableScroll();
		}
	});
	$('.sidebarSlideWrap').click(function(){
		if( !$('.sidebarSlide:hover').length ) {
			$('.sidebarToggle').click();
		}
	});
	$('.sidebarSlide').scroll(function () {
		mto('sidebarSlide', function(){
			if( $('.sidebarSlide').scrollTop() >= 10 ){
				if( !$('.sidebarToggle').hasClass('unvis') ) {
					$('.sidebarToggle').addClass('unvis');
				}
			}else{
				if( $('.sidebarToggle').hasClass('unvis') ) {
					$('.sidebarToggle').removeClass('unvis');
				}
			}
		},1000);
	});
});