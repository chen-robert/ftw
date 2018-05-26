const request = require("request");

const utils = {};

// Arrow functions are fun to use
const fact = n => Array(n).fill().map((_, pos) => pos + 1).reduce((acc, num) => acc * num, 1);

// Sieve of Eratosthenes
const isPrime = function isPrimeNumber(n) {
  if (Number.isNaN(n) || !Number.isFinite(n) || n < 2) {
    return false;
  }

  const primes = Array(n).fill(true);

  for (let i = 2; i ** 2 <= n; i += 1) {
    if (primes[i - 1]) {
      for (let j = i ** 2; j <= n; j += i) {
        primes[j - 1] = false;
      }
    }

    if (!primes[n - 1]) {
      return false;
    }
  }

  return true;
};

const gcd = function greatestCommonDenominator(a, b) {
  if (a % b === 0) {
    return b;
  }

  if (b % a === 0) {
    return a;
  }

  if (a > b) {
    return gcd(b, a % b);
  }

  return gcd(a, b % a);
};

// Generates a random integer from [a, b).
const rand = function(a, b) {
  return Math.floor((b - a) * Math.random()) + a;
};

/**
 * READ ME BEFORE YOU EDIT PROBLEMS
 * Problems may (and in most cases, should) contain LaTeX.
 * Answer must be in the form of a String. However, please do NOT use '' + to type coerce integers.
 * Doing is is generally bad practice and can lead to unintended results.
 * Use the String method.
 *
 * TEMPLATE
 * problems.push(() => {
 *   return {
 *     text: '',
 *     answer: '',
 *   };
 * });
 */

utils.getProblem = () => {
  return problems[Math.floor(problems.length * Math.random())];
};

const problems = [];
const PROBLEM_COUNT = 10000;

const problemLoadInterval = setInterval(() => {
  if(problems.length > PROBLEM_COUNT) {
    clearInterval(problemLoadInterval);
    return;
  }
  
  const seed = rand(0, 1000000);
  
  request("https://www.mathfactcafe.com/worksheet/wordproblem/display/?ProblemCount=15&Difficulty=Hard&TextSize=Medium&Score=true&Numbering=true&WorksheetDisplayType=Answers&Seed=" + seed + "&CreateType=WordProblemCustom", (err, res, body) => {
    if (err) { return console.log(err); }
    const regex = /(?<=<span class="wp-(question|answer)">).*?(?=<\/span>)/g;
    
    const problemParts = [];
    match = regex.exec(body);
    while(match != null){
      problemParts.push(match[0]);
      
      match = regex.exec(body);
    }
    
    if(problemParts.length % 2 != 0){
      console.log("Error with problem loading!");
    }else{
      for(var i = 0; i < problemParts.length; i+=2){
        problems.push({
          text: problemParts[i],
          answer: problemParts[i+1]
        });
      }
    }
    
  });
  
  
}, 10000);

module.exports = utils;
