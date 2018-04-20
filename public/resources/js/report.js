'use strict';

/* eslint-env browser, jquery */
(function () {
  $(document).ready(function () {
    $('#report-button').click(function () {
      if ($('#username').val() !== '' && $('#comment').val() !== '') {
        $('report-button').addClass('disabled');
        $('.loading-bar').css('background-color', '777');
        $('.loading-display').animate({ width: '100%' }, 1000);

        $.ajax({
          url: '/report',
          method: 'POST',

          data: {
            username: $('#username').val(),
            comment: $('#comment').val()
          }
        }).done(function (data) {
          $('#alert').removeClass('alert-danger');
          $('#alert').removeClass('alert-success');

          $('#alert').addClass(data.success ? 'alert-success' : 'alert-danger');

          $('.loading-display').stop(true, true);
          $('.loading-display').css('width', '0%');
          $('report-button').removeClass('disabled');

          $('#alert-text').text(data.text);
          $('#alert').stop(true, true);
          $('#alert').show();
          $('#alert').css('top', '-100px');
          $('#alert').animate({ top: '50px' }, 1000).delay(2000).fadeOut(1000);

          if (data.success) {
            $('#username').val('');
            $('#comment').val('');
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
//# sourceMappingURL=report.js.map