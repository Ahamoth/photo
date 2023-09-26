$(document).ready(function(){
	bindForms();
});

function formPreloader(el, on){
	if(el.find('.preloader-item').length){
		formPreloader(el.find('.preloader-item'), on);
	}else {
		switch (el.prop('tagName')) {
			case 'FORM':
				if( on ){
					el.addClass('loading');
				}else{
					el.removeClass('loading');
				}

				if (!el.find('.preloader').length) {
					el.prepend('<div class="preloader"><div class="d-flex h-100 justify-content-center align-items-center"><i class="fa fa-spinner fa-spin"></i></div></div>');
					el.find('.preloader').hide();
				}
				if (on) {
					el.find('.preloader').stop(true, true).fadeIn();
				} else {
					el.find('.preloader').stop(true, true).fadeOut();
				}
				break;
			default:
				if (el.find('i').length && !el.hasClass('preloader-full')) {
					if (on) {
						el.find('i').addClass('fa-spinner fa-spin');
					} else {
						el.find('i').removeClass('fa-spinner fa-spin');
					}
				} else {
					el.addClass('preloader-full');
					if (!el.data('original-text')) {
						el.data('original-text', el.html());
					}
					if (on) {
						el.html('<i class="fa fa-spinner fa-spin"></i>');
					} else {
						el.html(el.data('original-text'));
					}
				}
				if( el.prop('tagName')=='BUTTON' ){
					el.prop('disabled', on==1);
				}
				break;
		}
	}
}

function bindForms(){
	$('form.ajax input[data-page]').val(matrix.page);
	$('form.ajax input[data-page-verify]').val(matrix.page_verify);

	$('form.ajax:not(.binded)').submit(function(e){
		var form = $(this);
		preventDefault(e);
		if( form.hasClass('sending') ){
			return false;
		}
		form.addClass('sending');

		formPreloader(form, true);

		form.find('.has-error .help-block').stop(true,true).slideUp();
		form.find('.has-error').removeClass('has-error');

		var formName = $(this).attr('name');
		if( $(this).find('[name="g-recaptcha-response"]').length ){
			if( !$(this).find('[name="'+formName+'[g_recaptcha_response]"]').length ){
				$(this).find('[name="g-recaptcha-response"]').after('<input type="hidden" name="' + formName + '[g_recaptcha_response]" value="">');
			}
			$(this).find('[name="'+formName+'[g_recaptcha_response]"]').val( $(this).find('[name="g-recaptcha-response"]').val() );
		}

		var formData = new FormData($(this)[0]);

		formBeforeSend(form, formData);

		formSend(form, formData);
		return false;
	});
	$('form.ajax:not(.binded)').find('input,select,textarea').on('focus change keyup', function(){
		var fg = $(this).parents('.form-group');
		if( fg.length && fg.hasClass('has-error') ){
			fg.find('.help-block').stop(true,true).slideUp();
			fg.removeClass('has-error');
		}
	});

	$('form.ajax:not(.binded)').addClass('binded');

	$('.g-recaptcha').each(function(){
		if( $.trim($(this).html()).length == 0 ) {
			uniqueId(this);
			var id = $(this).attr('id');
			if( typeof grecaptcha != 'undefined' && typeof grecaptcha.render != 'undefined' ) {
				grecaptcha.render(id, {
					sitekey: matrix.recaptchaPublicKey,
					theme: 'dark',
					callback: function (response) {
						captchaLoad();
					}
				});
				captchaLoad();
			}
		}
	});
}

function formSend(form, formData){
	$.post('/action/csrf', {}, function(csrf){
		$('meta[name="csrf-token"]').attr('content', csrf);
		formProceedSend(form, formData);
	});
}

function formProceedSend(form, formData){
	$.ajax({
		dataType: 'json',
		type: form.attr('method'),
		url: form.attr('action'),
		data: formData,
		contentType: false,
		processData: false,
		success: function(data)
		{
			form.removeClass('sending');
			if( form.find('[name="g-recaptcha-response"]').length && $('[name="g-recaptcha-response"]').val().length > 0 ){
				grecaptcha.reset();
				captchaLoad();
			}
			validateAnswer( data, form );
			formPreloader(form, false);
		}
	});
}

function validateAnswer( data, form ){
	if( form && typeof(data.errors)!='undefined') {
		var formName = form.attr('name');
		var fieldElement, formGroup;
		$.each(data.errors, function (field, errors) {
			fieldElement = form.find('[name="' + formName + '[' + field + ']"]:last');
			if( $('[data-field="' + formName + '[' + field + ']"]:last').length ){
				fieldElement = $('[data-field="' + formName + '[' + field + ']"]:last');
			}
			if (fieldElement.length) {
				formGroup = fieldElement.parents('.form-group:first');
				formGroup.find('.help-block').stop(true, true);
				formGroup.addClass('has-error');
				if (!formGroup.find('.help-block').length) {
					fieldElement.after('<div class="help-block"></div>');
				}
				formGroup.find('.help-block').html('');
				$.each(errors, function (i, v) {
					formGroup.find('.help-block').append('<div>' + v + '</div>');
				});
			}
		});
		validateAnswerParam(data.errors, form);
		form.find('.has-error .help-block').stop(true, true).hide().slideDown();

		if( form.find('.has-error:first').length ) {
			kScroll(form.find('.has-error:first').offset().top - $(window).height() / 2, 750);
		}
	}
	validateAnswerParam(data, form);
	customForm(form, data);
	if(typeof(data.success)!='undefined' && data.success==true) {
		successForm(form, data);
	}
}

function validateAnswerParam(data, form){
	if( typeof(data.reload)!='undefined' ){
		setTimeout(function(){
			window.location.reload();
		}, data.reload);
	}
	if( typeof(data.redirect)!='undefined' ){
		setTimeout(function(){
			window.location.href = data.redirect.href;
		}, (typeof data.redirect.to!='undefined')?data.redirect.to:0);
	}
	if( typeof(data.popup)!='undefined' ){
		if( typeof(data.popup[0])!='undefined' ){
			popup(data.popup[0].title, data.popup[0].text);
		}else {
			popup(data.popup.title, data.popup.text);
		}
	}
	if( typeof(data.block_load)!='undefined' ){
		$.each(data.block_load, function(i, block_name){
			block_load(block_name);
		});
	}
	if( typeof(data.clean)!='undefined' ){
		clearForm(form);
	}
}

function clearForm( form ){
	form.find('input,textarea').val('');
}

function formBeforeSend(form, data){
	if( form && form.attr('name') ) {
		switch (form.attr('name')) {
			case 'InstagramSearchForm':
				$('.instagram-profile').slideUp(function(){
					$(this).html('');
				});
				break;
		}
	}
}

function customForm(form, data){
	if( form && form.attr('name') ) {
		switch (form.attr('name')) {
			case 'FeedbackForm':

				break;
		}
	}
}

function successForm(form, data){
	if( form && form.attr('name') ) {
		switch (form.attr('name')) {
			case 'FeedbackForm':
				clearForm(form);
				break;
		}
	}
}