(function () {
    "use strict";

    $(document).ready(function () {
        $("#sign-in").click(function () {
            $("#sign-in").addClass("active");
            $("#create").removeClass("active");

            $("#login-form").attr("action", "/login");
            $("#login-button").text("Sign In");
        });


        $("#create").click(function () {
            $("#create").addClass("active");
            $("#sign-in").removeClass("active");

            $("#login-form").attr("action", "/create-account");
            $("#login-button").text("Create Account");
        });
    });
})();
