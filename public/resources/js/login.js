'use strict';

/* eslint-env browser, jquery */
(function () {
  $(document).ready(function () {
    $('#sign-in').click(function () {
      $('#sign-in').addClass('active');
      $('#create').removeClass('active');

      $('#login-form').attr('action', '/login');
      $('#login-button').text('Sign In');
    });

    $('#create').click(function () {
      $('#create').addClass('active');
      $('#sign-in').removeClass('active');

      $('#login-form').attr('action', '/create-account');
      $('#login-button').text('Create Account');
    });

    $('.form-control').keydown(function (e) {
      if (e.which === 13) {
        $('#login-form').submit();
      }
    });

    $('#login-form').submit(function loginToGame(e) {
      e.preventDefault(e);
      if ($('#username').val() !== '' && $('#password').val() !== '') {
        $('login-button').addClass('disabled');
        $('.loading-bar').css('background-color', '777');
        $('.loading-display').animate({ width: '100%' }, 1000);

        $.ajax({
          url: this.action,
          method: 'POST',

          data: {
            username: $('#username').val(),
            password: $('#password').val()
          }
        }).done(function (data) {
          if (data.redirect) {
            window.location.href = data.redirect;
          } else {
            $('.loading-display').stop(true, true);
            $('.loading-display').css('width', '0%');
            $('login-button').removeClass('disabled');

            $('#alert-text').text(data);
            $('#alert').stop(true, true);
            $('#alert').show();
            $('#alert').css('top', '-100px');
            $('#alert').animate({ top: '50px' }, 1000).delay(2000).fadeOut(1000);
          }
        });
      } else {
        $('.form-control').each(function showInvalidMessage() {
          var form = $(this);
          if (form.val() === '') {
            form.addClass('is-invalid');
            form.removeClass('is-valid');

            $('div[for=' + form.prop('name') + ']').show();
            console.log('div[for=' + form.prop('name') + ']');
          } else {
            form.addClass('is-valid');
            form.removeClass('is-invalid');

            $('div[for=' + form.prop('name') + ']').hide();
          }
        });
      }
    });
  });
})();
//# sourceMappingURL=login.js.map