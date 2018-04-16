const request = require('request');

const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const jquery = require('jquery');

const utils = {};

utils.getProblem = () => new Promise((res) => {
  const year = (new Date().getYear() - Math.floor(10 * Math.random())) + 1899;
  const prob = Math.floor(25 * Math.random()) + 1;

  request(`https://artofproblemsolving.com/wiki/index.php?title=${year}_AMC_8_Problems/Problem_${prob}`, (err, resp, body) => {
    // Use jQuery to parse response
    const $ = jquery((new JSDOM(body)).window);

    // AoPS Wiki is not *normally* robot readable, so we'll have to use parsing tricks
    const text = $('span[id^="Solution"]').first().parent().prevAll(':not(h2, h3, #toc)')
      .toArray()
      .reverse()
      .reduce((html, elem) => `${html + elem.innerHTML}<br />`, '');

    /**
     *  This method should catch the majority of answers.
     *  However, if it doesn't work, just grab another problem.
     */
    try {
      const answer = $('img.latex').last().attr('alt').match(/\(([ABCDE])\)/)[1];

      res({
        text,
        answer,
      });
    } catch (e) {
      utils.getProblem().then((data) => {
        res(data);
      });
    }
  });
});

module.exports = utils;
