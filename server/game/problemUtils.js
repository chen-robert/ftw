const utils = {};

utils.getProblem = function () {
    let g = Math.floor(10 * Math.random());
    
    if (g >= 0 && g < 3){
        let a = Math.floor(100 * Math.random());
        let b = Math.floor(100 * Math.random());
        return {
            text: "wot is " + a + " + " + b + "?",
            answer: "" + (a + b)
        };
    }
    if (g >= 3 && g < 6){
        let a = Math.floor(200 * Math.random());
        let b = Math.floor(150 * Math.random());
        return {
            text: "wot is " + a + " - " + b + "?",
            answer: "" + (a - b)
        };
    }
    if (g >= 6 && g < 8){
        let a = Math.floor(30 * Math.random());
        let b = Math.floor(20 * Math.random());
        return {
            text: "wot is " + a + " * " + b + "?",
            answer: "" + (a * b)
        };
    }
    if (g >= 8 && g < 10){
        let a = Math.floor(500 * Math.random());
        let b = Math.floor(11 * Math.random()) + 2;
        return {
            text: "wot is " + a + " mod " + b + "?",
            answer: "" + (a % b)
        };
    }
    
    //this part should never actually run?
    let a = Math.floor(100 * Math.random());
    return {
        text: "wot is " + a + "?",
        answer: "" + (a)
    };
}

module.exports = utils;
