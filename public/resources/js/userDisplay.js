'use strict';

/* eslint-env browser, jquery */
(function () {
  if (window.FTW && !window.FTW.userUtils) {
    var userUtils = {};

    userUtils.setUsers = function (data) {
      data.sort(function (a, b) {
        return b.rating - a.rating;
      });
      $('#userData').empty();

      for (var i = 0; i < data.length; i += 1) {
        $('#userData').append('<tr><td>' + data[i].username + '</td><td class="text-right">' + Math.round(data[i].rating) + '</td></tr>');
      }
    };

    window.FTW.userUtils = userUtils;
  }
})();
//# sourceMappingURL=userDisplay.js.map