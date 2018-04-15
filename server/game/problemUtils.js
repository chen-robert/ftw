const utils = {};

utils.getProblem = function () {
    let g = Math.floor(12 * Math.random());
    
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
    
    if (g === 10){
        let a = Math.floor(480 * Math.random()) + 20;
        let b = Math.floor(5 * Math.random()) + 2;
        return {
            text: "What is the largest integer x such that " + b + " to the x is less than " + a + "?",
            answer: "" + Math.floor(Math.log(a) / Math.log(b))
        };
    }
    
    if (g === 11){
        let a = Math.floor(45 * Math.random()) + 5;
        return {
            text: "What is the sum of the first " + a + " integers?",
            answer: "" + a * (a + 1) / 2
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
