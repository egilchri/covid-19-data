const functions = require('firebase-functions');
const { dialogflow, Permission, SimpleResponse } = require("actions-on-google");
const app = dialogflow();

// foo
const request = require('request');
// const JSON = require ('json');
const https = require('https');

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());


app.intent("Default Welcome Intent", conv => {
  conv.data.requestedPermission = "DEVICE_PRECISE_LOCATION";
  conv.ask(new SimpleResponse('Welcome to location tracker'));
  return conv.ask(
    new Permission({
      context: "to locate you",
      permissions: conv.data.requestedPermission
    })
  );
});


app.intent("get_current_location", (conv, params, permissionGranted) => {
  if (permissionGranted) {
    const { requestedPermission } = conv.data;
    let address;
    if (requestedPermission === "DEVICE_PRECISE_LOCATION") {
      const { coordinates } = conv.device.location;
      console.log('coordinates are', coordinates);

      if (coordinates && address) {
        return conv.close(new SimpleResponse(`Your Location details ${address}`));
      } else {
        // Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates
        // and a geocoded address on voice-activated speakers.
        // Coarse location only works on voice-activated speakers.
        return conv.close("Sorry, I could not figure out where you are.");
      }
    }
  } else {
    return conv.close("Sorry, permission denied.");
  }
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello and howdy doody from Firebase!");
 });

exports.goodbyeWorld = functions.https.onRequest((req, response) => {
   functions.logger.info("Goodbye logs!", {structuredData: true});
   response.send("Goodbye from Firebase!");
});

exports.get_deaths = functions.https.onRequest(async (req, response) => {
   functions.logger.info("Getting death statistics", {structuredData: true});
    var url2 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.201128.deaths.sorted.json';
//    var url3 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.201128.deaths.sorted.json';

// foo
    // functions.logger.info(body);
   functions.logger.info("Have a nice day ", {structuredData: true});
    var county_name = "Rockingham";
    var state_name = "New Hampshire";
    var returnObj2 = await getMyUrl(url2, county_name, state_name, "deaths");
//    var returnObj3 = await getMyUrl(url3, county_name, state_name, "cases");
    functions.logger.info(`returnObj2 ${JSON.stringify(returnObj2)}`);

    // var parsed = JSON.parse(returnOb2);
    response.send(`In ${county_name} County, ${state_name} deaths, as of today is ${returnObj2['now']}.  Deaths one week ago was ${returnObj2['wk_ago']}.  `);
   // req.status(200).send("Success");
 });

exports.get_cases = functions.https.onRequest(async (req, response) => {
   functions.logger.info("Getting death statistics", {structuredData: true});
    var url3 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.201128.cases.sorted.json';

// foo
    // functions.logger.info(body);
   functions.logger.info("Have a nice day ", {structuredData: true});
    var county_name = "Rockingham";
    var state_name = "New Hampshire";
    var returnObj3 = await getMyUrl(url3, county_name, state_name, "cases");
    functions.logger.info(`returnObj3 ${JSON.stringify(returnObj3)}`);

    // var parsed = JSON.parse(returnOb2);
    response.send(`In ${county_name} County, ${state_name} cases, as of today is ${returnObj3['now']}.  Cases one week ago was ${returnObj3['wk_ago']}. `);
   // req.status(200).send("Success");
 });


async function doGetMyUrl(url2, county_name, state_name, trend_type){

    var returnObj = getMyUrl(url2, county_name, state_name, trend_type);
    functions.logger.info(`doGetMyUrl got ${JSON.stringify(returnObj)} `, {structuredData: true});
    return returnObj;
}

async function getMyUrl(url, county_name, state_name, trend_type) {
  return new Promise(function (resolve, reject) {
    let dataString = '';
    let sayNew = '';
    let order = '';

    try{
    const req = https.get(url, function (res) {
      res.on('data', chunk => {
        dataString += chunk;
      });
      res.on('end', () => {
      // console.log (`dataString is ${dataString}`);
      var obj = {};

      try{
      obj = JSON.parse(dataString);
}
     catch(e){
console.log (`Oh my gosh. Error is ${JSON.stringify(e)}`);
     resolve ({});
     // return;
}

        // console.log (`dataString: ${dataString}`);
        debugger;
        console.log(`calling getCountyInfo(obj, ${county_name}, ${state_name})`);
        county_name = county_name.toLowerCase();
        state_name = state_name.toLowerCase();
        county_name = county_name.replace(' county', '');

        county_name = capitalize(county_name);
        state_name = capitalize(state_name);
        console.log(`now calling getCountyInfo(obj, ${county_name}, ${state_name})`);
        var info = getCountyInfo(obj, county_name, state_name)
        if (info === null){
       return null;
}
        console.log (`info: ${info}`);
        var length = obj.length;
        order = info['order'];

        var percentile = Math.round(100 * (order / length));
	info['percentile'] = percentile;

        var rate = info['rate'];
        var rounded = Math.round(rate);
        console.log(`but how come order is ${order}?`);
        console.log(`got the datastring ${JSON.stringify(info)}`);
        resolve (info);
        trend_type + ' is ' + order + ' out of ' + length;
     
        var nowNumber = info['now'];
        var wkAgoNumber = info ['wk_ago'];
        var lkBackDiff = parseInt(nowNumber, 10) - parseInt(wkAgoNumber, 10);
        var looking_back_explain = ` There was an increase of ${lkBackDiff} ${trend_type} over the past 7 days.`;
        sayNew = `${county_name} county ${state_name} `;

        var returnObj={};
        if (percentile < 50) {
          sayNew = ` ${sayNew} is in the top ${percentile} per cent, in ${trend_type}.`;
          	returnObj['percentile'] = `top ${percentile}`;
        } else {
           var backPercentile = 100 - percentile;
          sayNew = ` ${sayNew} is in the bottom  ${backPercentile} per cent in ${trend_type}.`;
          returnObj['percentile'] = `bottom ${backPercentile}`;	   
        }

        sayNew = sayNew + looking_back_explain;
        // console.log(`sayNew: ${sayNew}`);


	returnObj['county_name']= county_name;
	returnObj['state_name']= state_name;
	returnObj['trend_type'] = trend_type;
        returnObj['lkBackDiff'] = lkBackDiff;
        resolve(returnObj);
      });
      req.on('error', (e) => {
        console.error(e);
      });
    });
}
catch(e){
console.log (`major booboo`);
throw (e);
}
  });
}

function getCountyInfo(data, county, state) {
  var found = null;
    console.log (`Getting county info for county: ${county} state ${state}`);
  console.log(`length of data is ${data.length}`);
  for (var i = 0; i < data.length; i++) {
    var element = data[i];

    /*
    if (i < 10){
        console.log (`county is ${element.county.toLowerCase()}`);
        console.log (`state is ${element.state.toLowerCase()}`);

    }
    */
    if ((element.county.toLowerCase() === county.toLowerCase()) &&
      (element.state.toLowerCase() === state.toLowerCase())) {
      found = element;
    }
  }

  return found;
}
