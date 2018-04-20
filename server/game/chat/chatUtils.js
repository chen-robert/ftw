const chatUtils = {};

chatUtils.clean = str =>
  str
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

chatUtils.parseLinks = (str) => {
  const norm = n => (n + (str.length + 1)) % (str.length + 1);

  let string = str;
  let index = Math.min(norm(str.indexOf('http://')), norm(str.indexOf('https://')));

  while (index !== string.length) {
    let end = string.indexOf(' ', index);

    if (end === -1) {
      end = string.length;
    }

    const urlText = string.substring(index, end);

    const ending = string.substring(end);
    string = `${string.substring(0, index)}<a target='_blank' rel='noopener noreferrer' href='${urlText}'>${urlText}</a>`;
    const nextStart = str.length;

    string += ending;

    index = Math.min(norm(str.indexOf('http://', nextStart)), norm(str.indexOf('https://', nextStart)));
  }

  return string;
};


module.exports = chatUtils;
