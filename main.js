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
import WiFi from "wifi";
import Timer from "timer";
import Net from "net";
import config from "mc/config";


let poco = new Poco(screen, {rotation: 90});
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

let palatino36 = parseBMF(new Resource("OpenSans-Regular-16.fnt"));
palatino36.bitmap = parseBMP(new Resource("OpenSans-Regular-16-alpha.bmp"));


// poco.drawText("Hello.", palatino36, black, 4, 20);
// poco.drawText("Hello.", palatino36, green, 4, 55);

poco.drawText("Loading...", palatino36, black, 4, 20);
poco.drawText("Trying to connect to " + config.ssid + "...", palatino36, black, 4, 40);

poco.end();

let monitor = new WiFi({
  ssid: config.ssid,
  password: config.password
}, msg => {
  switch (msg) {
    case WiFi.connected:
      break; // still waiting for IP address
    case WiFi.gotIP:
      trace(`IP address ${Net.get("IP")}\n`);

      Timer.repeat(id => {
        getMeetingStatus();
      }, 29000);
      break;
    case WiFi.disconnected:
      break; // connection lost
  }
});

// Timer.repeat(id => {

function getMeetingStatus() {
  trace('inside getMeetingStatus');
  let request = new Request({
    host: "raw.githubusercontent.com",
    path: "/aakoch/in-a-meeting/master/status",
    response: String,
    port: 443,
    Socket: SecureSocket,
    secure: {
      protocolVersion: 0x303
    }
  });

  trace('request made\n');

  let previousValue = false;
  let startTime = new Date();

  request.callback = function (message, value, etc) {
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
      } else {
        trace('in a meeting\n');

        poco.begin();

        poco.fillRectangle(red, 0, 0, poco.width, poco.height);

        poco.drawText("In a meeting", palatino36, black, 4, 20);
        poco.end();

        //poco.drawText("since " + startTime.toLocaleTimeString(), palatino36, black, 4, 40);
        // trace("it's been " + (new Date() - startTime) + " ms");

        Timer.repeat(id => {
          poco.begin();
          poco.fillRectangle(red, 0, 0, poco.width, poco.height);
          poco.drawText("In a meeting", palatino36, black, 4, 20);
          poco.drawText("for " + formatDisplayTime(startTime), palatino36, black, 4, 40);
          poco.end();
        }, 1000);


        if (!previousValue) {
          startTime = new Date()
        }
      }
    }

    // request.close();
  }
}


// }, 10000);

// From https://ralzohairi.medium.com/displaying-dynamic-elapsed-time-in-javascript-260fa0e95049
function formatDisplayTime(startTime) {

  // Record end time
  let endTime = new Date();

  // Compute time difference in milliseconds
  let timeDiff = endTime.getTime() - startTime.getTime();

  // Convert time difference from milliseconds to seconds
  timeDiff = timeDiff / 1000;

  // Extract integer seconds that dont form a minute using %
  let seconds = Math.floor(timeDiff % 60); //ignoring uncomplete seconds (floor)

  // Pad seconds with a zero if neccessary
  let secondsAsString = seconds < 10 ? "0" + seconds : seconds + "";

  // Convert time difference from seconds to minutes using %
  timeDiff = Math.floor(timeDiff / 60);

  // Extract integer minutes that don't form an hour using %
  let minutes = timeDiff % 60; //no need to floor possible incomplete minutes, becase they've been handled as seconds

  // Pad minutes with a zero if neccessary
  let minutesAsString = minutes < 10 ? "0" + minutes : minutes + "";

  // Convert time difference from minutes to hours
  timeDiff = Math.floor(timeDiff / 60);

  // Extract integer hours that don't form a day using %
  let hours = timeDiff % 24; //no need to floor possible incomplete hours, becase they've been handled as seconds

  // Convert time difference from hours to days
  timeDiff = Math.floor(timeDiff / 24);

  // The rest of timeDiff is number of days
  let days = timeDiff;

  let totalHours = hours + (days * 24); // add days to hours
  let totalHoursAsString = totalHours < 10 ? "0" + totalHours : totalHours + "";

  if (totalHoursAsString === "00") {
    return minutesAsString + ":" + secondsAsString;
  } else {
    return totalHoursAsString + ":" + minutesAsString + ":" + secondsAsString;
  }

}


trace('end\n');