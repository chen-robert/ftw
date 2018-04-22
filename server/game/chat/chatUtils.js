const chatUtils = {};

chatUtils.clean = str =>
  str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

chatUtils.parseLinks = str => str.replace(
  /http(|s):\/\/([A-Za-z0-9./%?=\-_]*)/g,
  '<a target="_blank" rel="noopener noreferrer" href="http$1://$2">http$1://$2</a>',
);

module.exports = chatUtils;
