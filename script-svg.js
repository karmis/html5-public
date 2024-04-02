/**
 * Created by dvvla on 15.09.2017.
 */

var fs = require('fs');
var text = '';

// async
fs.readFile('./src/assets/icons/svg-symbols.svg', 'utf8', function(oErr, sText) {
  // console.log(sText);
  // textShow(sText);
  var arr = sText.toString().split('\n');
  textShow(arr);
  // var t = sText.substring(44, 39107);
  // console.log(sText);
});
function textShow(texts) {
  var i = 1;
  var str = '';
  while(i <= texts.length - 3) {
    str = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">\r\n' + texts[i+1] + '\r\n' + '</svg>';
    var j = 0;
    var repeat = 0;
    var start = 0;
    var end = 0;
    var id = texts[i];
    while(j < str.length) {
      if (id[j] == '"') {
        repeat = repeat + 1;
        if (repeat == 1) {
          start = j + 1;
        } else if (repeat == 2) {
          end = j;
          break;
        }
      }
      j++;
    }
    var name = id.substring(start, end);
    var path = "./src/assets/icons/svg/" + name + '.svg';
    fs.writeFile(path, str);
    i = i+3;
  }
}
