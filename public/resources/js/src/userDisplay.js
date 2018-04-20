/* eslint-env browser, jquery */
(() => {
  if (window.FTW && !window.FTW.userUtils) {
    const userUtils = {};

    userUtils.setUsers = (data) => {
      data.sort((a, b) => b.rating - a.rating);
      $('#userData').empty();

      for (let i = 0; i < data.length; i += 1) {
        $('#userData').append(`<tr><td>${data[i].username}</td><td class="text-right">${Math.round(data[i].rating)}</td></tr>`);
      }
    };

    window.FTW.userUtils = userUtils;
  }
})();
