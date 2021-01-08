/*
 * This work is based on examples from the Moddable SDK:
 *   https://github.com/Moddable-OpenSource/moddable/tree/public/examples
 * Moddable copyright info:
 *   Copyright (c) 2016-2018  Moddable Tech, Inc.
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
import {} from "piu/MC";
import {Request} from "http"
import SecureSocket from "securesocket";
import Poco from "commodetto/Poco";
import parseBMF from "commodetto/parseBMF";
import parseBMP from "commodetto/parseBMP";
import Resource from "Resource";
// import Timer from "timer";

let poco = new Poco(screen);
poco.begin();

let white = poco.makeColor(255, 255, 255);
let black = poco.makeColor(0, 0, 0);
let gray = poco.makeColor(128, 128, 128);
let red = poco.makeColor(255, 0, 0);
let green = poco.makeColor(0, 255, 0);
let blue = poco.makeColor(0, 0, 255);

trace('enter\n');

poco.fillRectangle(gray, 0, 0, poco.width, poco.height);
// poco.fillRectangle(red, 5, 5, 10, 10);


// poco.fillRectangle(gray, 0, 0, poco.width, poco.height);
// poco.fillRectangle(white, 2, 2, poco.width - 4, poco.height - 4);

let palatino36 = parseBMF(new Resource("palatino_36.fnt"));
palatino36.bitmap = parseBMP(new Resource("palatino_36.bmp"));


// poco.drawText("Hello.", palatino36, black, 4, 20);
// poco.drawText("Hello.", palatino36, green, 4, 55);

poco.drawText("Loading...", palatino36, black, 4, 20);

poco.end();


trace('poco made\n');

// Timer.repeat(id => {

let request = new Request({
  host: "raw.githubusercontent.com", 
  path: "/aakoch/in-a-meeting/master/status", 
  response: String, 
  port: 443, Socket: SecureSocket,
  secure: {protocolVersion: 0x303}});

  trace('request made\n');
  
  let previousValue = false;

request.callback = function(message, value, etc)
{
	if (Request.header === message)
		trace(`${value}: ${etc}\n`);
	else if (Request.responseComplete === message) {
    trace("->" + value + "<-\n");

    for (let i = 0; i < value.length; i++) {

        trace(value.charAt(i) + "\n");
    }
    if (value.trim() == 'false') {
      trace('not in a meeting') 
      poco.begin();
      poco.fillRectangle(green, 0, 0, poco.width, poco.height);

      poco.drawText("Not in a meeting", palatino36, black, 4, 20);
      poco.end();

      if (previousValue) {
        startTime = new Date()
      }
    }
    else {
      trace('in a meeting');

      poco.begin();

      poco.fillRectangle(red, 0, 0, poco.width, poco.height);

      poco.drawText("In a meeting", palatino36, black, 4, 20);
      poco.drawText("since " + startTime, palatino36, black, 4, 40);
      poco.drawText("it's been " + (new Date() - startTime) + " ms", palatino36, black, 4, 60);
      poco.end();

      if (!previousValue) {
        startTime = new Date()
      }
    }
  }

// request.close();
}


// }, 10000);


trace('end\n');