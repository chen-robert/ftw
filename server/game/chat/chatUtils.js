"use strict";

const chatUtils = {};
chatUtils.clean = function (str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

chatUtils.parseLinks = function (str) {
  function norm(n) {
    return (n + (str.length + 1)) % (str.length + 1);
  }
  var index = Math.min(norm(str.indexOf("http://")), norm(str.indexOf("https://")));
  while (index != str.length) {
    var end = str.indexOf(" ", index);
    if (end == -1) end = str.length;

    var urlText = str.substring(index, end);

    var ending = str.substring(end);
    str = str.substring(0, index) + "<a target=\"_blank\" rel=\"noopener noreferrer\"" +
      "href=\"" + urlText + "\">" + urlText + "</a>";
    var nextStart = str.length;

    str += ending;

    index = Math.min(norm(str.indexOf("http://", nextStart)),
      norm(str.indexOf("https://", nextStart)));
  }
  return str;
}


module.exports = chatUtils;
