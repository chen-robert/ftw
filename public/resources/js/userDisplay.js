(function () {
  "use strict";
  if (window.FTW && !window.FTW.userUtils) {
    const userUtils = {};

    userUtils.setUsers = function (data) {
      data.sort((a, b) => b.rating - a.rating);
      $("#userData").empty();
      for (var i = 0; i < data.length; i++) {
        $("#userData").append("<tr><td>" + data[i].username + "</td><td class='text-right'>" + Math.round(data[i].rating) + "</td></tr");
      }
    }

    window.FTW.userUtils = userUtils;
  }
})();
