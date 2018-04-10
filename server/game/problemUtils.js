const utils = {};

utils.getProblem = function () {
    let a = Math.floor(100 * Math.random());
    let b = Math.floor(100 * Math.random());
    return {
        text: "wot is " + a + " + " + b + "?",
        answer: "" + (a + b)
    };
}

module.exports = utils;
