const utils = {};

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
//Generates a random integer from [a, b).
const rand = function (a, b) {
  return Math.floor((b - a + 1) * Math.random()) + a;
}
/**
 * READ ME BEFORE YOU EDIT PROBLEMS
 * Problems may (and in most cases, should) contain LaTeX.
 * Answer must be in the form of a String. However, please do NOT use '' + to type coerce integers.
 * Doing is is generally bad practice and can lead to unintended results.
 * Use the String method.
 */

/*
          
          TEMPLATE
          
problems.push(() => {
    return {
      text: ``,
      answer: String(),
    };
  });
*/
utils.getProblem = () => {
  //This is an array of FUNCTIONS
  const problems = [];

  problems.push(() => {
    const a = Math.floor(200 * Math.random());
    const b = Math.floor(100 * Math.random());

    return {
      text: `What is the value of $${a} + ${b}$?`,
      answer: String(a + b),
    };
  });

  problems.push(() => {
    const a = Math.floor(200 * Math.random());
    const b = Math.floor(150 * Math.random());

    return {
      text: `What is the value of $${a} - ${b}$?`,
      answer: String(a - b),
    };
  });

  problems.push(() => {
    const a = Math.floor(30 * Math.random());
    const b = Math.floor(20 * Math.random());

    return {
      text: `What is the value of $${a} \\cdot ${b}$?`,
      answer: String(a * b),
    };
  });

  iproblems.push(() => {
    const a = Math.floor(500 * Math.random());
    const b = Math.floor(11 * Math.random()) + 2;

    return {
      text: `What is the value of $${a} \\pmod{${b}}$?`,
      answer: String(a % b),
    };
  });

  problems.push(() => {
    const a = Math.floor(480 * Math.random()) + 20;
    const b = Math.floor(5 * Math.random()) + 2;

    // Check for floating point errors
    const log = Math.log(a) / Math.log(b);
    const round = Math.floor(log + 0.5);

    return {
      text: `What is the largest integer $x$ such that $${b}^x \\le ${a}$?`,
      answer: String(a ** round === b ? round : Math.floor(log)),
    };
  });

  problems.push(() => {
    const a = Math.floor(45 * Math.random()) + 5;

    return {
      text: `What is the sum of the first $${a}$ integers?`,
      answer: String((a * (a + 1)) / 2),
    };
  });

  problems.push(() => {
    const a = Math.floor(41 * Math.random()) - 20;
    let b = 0;

    while (b === 0) {
      b = Math.floor(41 * Math.random()) - 20;
    }

    const c = Math.floor(100 * Math.random()) + 1;

    return {
      text: `Solve the equation: $${b}x + ${c} = ${(a * b) + c}$`,
      answer: String(a),
    };
  });

  //  problems.push(() => {
  //    const a = Math.floor(35 * Math.random()) + 5;
  //    const b = Math.floor(10 * Math.random()) + 1;
  //    const c = Math.floor(15 * Math.random()) + 5;
  //
  //    return {
  //      text: `If Bobert the builder can build $${a}$ houses in $${b}$ day${b === 1 ? '' : 's'}, how many completed houses can Bobert build in $${c}$ days?`,
  //      answer: String(Math.floor((a * c) / b)),
  //    };
  //  });

  problems.push(() => {
    const a = Math.floor(10 * Math.random()) + 1;
    const b = Math.floor(50 * Math.random()) + a;
    const c = Math.floor(2 * Math.random());

    return {
      text: `Alex and Bobert take turns taking between $1$ and $${a}$ sticks from a pile starting from $${b}$. If the last person to take a stick wins, and ${(c > 0 ? 'Alex' : 'Bobert')} goes first, who wins?`,
      answer: (b % (a + 1) === 0) ? ['Alex', 'Bobert'][c] : ['Alex', 'Bobert'][1 - c],
    };
  });

  problems.push(() => {
    const num = Math.floor(100 * Math.random()) + 100;
    let n = num;
    let sum = 0;
    let i = 2;

    while (n !== 1) {
      if (n % i === 0 && isPrime(i)) {
        sum += i;

        while (n % i === 0) {
          n /= i;
        }
      }

      i += 1;
    }

    return {
      text: `What is the sum of the prime factors of $${num}$?`,
      answer: String(sum),
    };
  });

  problems.push(() => {
    const num = Math.floor(400 * Math.random()) + 100;
    let zeros = 0;

    for (let pow = 1; 5 ** pow <= num; pow += 1) {
      zeros += Math.floor(num / (5 ** pow));
    }

    return {
      text: `How many terminating zeros does $${num}!$ have?`,
      answer: String(zeros),
    };
  });

  problems.push(() => {
    const a = Math.floor(22 * Math.random()) + 2;
    let b;

    do {
      b = Math.floor(22 * Math.random()) + 2;
    } while (gcd(a, b) !== 1);

    // Max number of chicken tendies we can't buy >:(
    const chickenTendies = (a * b) - a - b;

    return {
      text: `Pencils are sold in either bundles of $${a}$ or $${b}$. What is the largest quantity of pencils that cannot be bought?`,
      answer: String(chickenTendies),
    };
  });

  problems.push(() => {
    const a = rand(1, 20);
    const area = 6 * a * a;
    const volume = a * a * a;
    return {
      text: `What is the volume of a cube with surface area $${area}$?`,
      answer: String(volume),
    };
  });
  problems.push(() => {
    const a = rand(3, 13);
    const ans = 2 ** a;
    return {
      text: `How many different outcomes can we get if we flip $${a}$ coins?`,
      answer: String(ans),
    };
  });

  let index = rand(0, problems.length);
  return problems[index]();
};

module.exports = utils;
