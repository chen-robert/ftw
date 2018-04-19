const utils = {};

// Sieve of Eratosthenes!
const isPrime = (n) => {
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

/**
 * READ ME BEFORE YOU EDIT PROBLEMS
 * Answer must be in the form of a String.
 * Please do NOT use "" + to type coerce integers, as it is bad practice.
 * Use String(...) or (...).toString() instead.
 */
utils.getProblem = () => {
  const g = Math.floor(30 * Math.random());

  if (g >= 0 && g < 3) {
    const a = Math.floor(200 * Math.random());
    const b = Math.floor(100 * Math.random());

    return {
      text: `What is the value of $${a} + ${b}$?`,
      answer: String(a + b),
    };
  }

  if (g >= 3 && g < 6) {
    const a = Math.floor(200 * Math.random());
    const b = Math.floor(150 * Math.random());

    return {
      text: `What is the value of $${a} - ${b}$?`,
      answer: String(a - b),
    };
  }

  if (g >= 6 && g < 8) {
    const a = Math.floor(30 * Math.random());
    const b = Math.floor(20 * Math.random());

    return {
      text: `What is the value of $${a} \\cdot ${b}$?`,
      answer: String(a * b),
    };
  }

  if (g >= 8 && g < 10) {
    const a = Math.floor(500 * Math.random());
    const b = Math.floor(11 * Math.random()) + 2;

    return {
      text: `What is the value of $${a} \\pmod{${b}}$?`,
      answer: String(a % b),
    };
  }

  if (g === 10) {
    const a = Math.floor(480 * Math.random()) + 20;
    const b = Math.floor(5 * Math.random()) + 2;

    return {
      text: `What is the largest integer $x$ such that $${b}^x < ${a}$?`,
      answer: String(Math.floor(Math.log(a) / Math.log(b))),
    };
  }

  if (g >= 11 && g < 13) {
    const a = Math.floor(45 * Math.random()) + 5;

    return {
      text: `What is the sum of the first $${a}$ integers?`,
      answer: String((a * (a + 1)) / 2),
    };
  }

  if (g >= 13 && g < 16) {
    const a = Math.floor(41 * Math.random()) - 20;
    const b = Math.floor(41 * Math.random()) - 20;
    const c = Math.floor(100 * Math.random()) + 1;

    return {
      text: `Solve the equation: $${b}x + ${c} = ${(a * b) + c}$`,
      answer: String(a),
    };
  }

  if (g >= 16 && g < 18) {
    const a = Math.floor(35 * Math.random()) + 5;
    const b = Math.floor(10 * Math.random()) + 1;
    const c = Math.floor(15 * Math.random()) + 5;

    return {
      text: `If Bobert the builder can build $${a}$ houses in $${b}$ days, how many completed houses can Bobert build in $${c}$ days?`,
      answer: String(Math.floor((a * c) / b)),
    };
  }

  if (g >= 18 && g < 20) {
    const a = Math.floor(10 * Math.random()) + 1;
    const b = Math.floor(50 * Math.random()) + a;
    const c = Math.floor(2 * Math.random());

    return {
      text: `Alex and Bobert take turns taking between $1$ and $${a}$ sticks from a pile starting from $${b}$. If the last person to take a stick wins, and ${(c > 0 ? 'Alex' : 'Bobert')} goes first, who wins?`,
      answer: (b % (a + 1) === 0) ? ['Alex', 'Bobert'][c] : ['Alex', 'Bobert'][1 - c],
    };
  }

  if (g >= 20 && g < 24) {
    const num = Math.floor(100 * Math.random()) + 100;
    let sum = 0;

    for (let i = 2; i <= num; i += 1) {
      if (num % i === 0 && isPrime(i)) {
        sum += i;
      }
    }

    return {
      text: `What is the sum of the prime factors of $${num}$?`,
      answer: String(sum),
    };
  }

  if (g >= 24 && g < 27) {
    const num = Math.floor(10000 * Math.random()) + 100;
    let zeros = 0;

    for (let pow = 1; 5 ** pow <= num; pow += 1) {
      zeros += Math.floor(num / (5 ** pow));
    }

    return {
      text: `How many terminating zeros does $${num}!$ have?`,
      answer: String(zeros),
    };
  }

  if (g >= 27 && g < 30) {
    const a = Math.floor(24 * Math.random());
    const b = Math.floor(24 * Math.random());

    // Number of chicken tendies we can't buy >:(
    const chickenTendies = (a * b) - a - b;

    return {
      text: `Pencils are sold in either bundles of $${a}$ or $${b}$. What is the largest quantity of pencils that cannot be bought?`,
      answer: String(chickenTendies),
    };
  }

  // This part should never actually run? (It won't be)
  const a = Math.floor(100 * Math.random());

  return {
    text: `wot is $${a}$`,
    answer: String(a),
  };
};

module.exports = utils;
