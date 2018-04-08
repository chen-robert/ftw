(function () {
    "use strict";
    if (window.FTW && !window.FTW.userUtils) {
        const userUtils = {};

        userUtils.setUsers = function (data) {
            console.log(data);
        }

        window.FTW.userUtils = userUtils;
    }
})();
