// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
// 'use (esversion: 10)';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const counties = require ('./new_counties5.js');

const {
    dialogflow,
    SimpleResponse,
    Permission,
} = require('actions-on-google');

// const {
// dialogflow,
// Permission
// } = require('actions-on-google');

const https = require('https');
const capitalize = (str, lower = false) =>
      (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());



process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
const app = dialogflow();
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.requestSource = agent.ACTIONS_ON_GOOGLE;
     let conv = agent.conv();
      conv.ask(new Permission({
        context: "So that I can look up your county",
        permissions:
            ['DEVICE_COARSE_LOCATION'],
    }));
//   conv.ask("How now brown cow?");
   agent.add(conv);

   }

   async function get_zipcode (agent) {
      agent.requestSource = agent.ACTIONS_ON_GOOGLE;
      let conv = agent.conv();
       agent.add(`Oh so you wanna change your zipcode`);
}

   async function get_stats (agent) {
agent.requestSource = agent.ACTIONS_ON_GOOGLE;
     let conv = agent.conv();

    console.log("Getting statistics", {structuredData: true});      
    console.log(`Date is ${datetime}`);
    const months = {"01" : "January", "02" : "February", "03" : "March","04" : "April","05" : "May","06" : "June","07" : "July","08" : "August","09" : "September","10" : "October","11" : "November","12" : "December"};


    var county_name;
    var state_name;
    var county_name1;
    var state_name1;
    var zip_code;

    const {location} = conv.device;
    if (location){
      zip_code = location.zipCode;

//    else{
//      zip_code = "03801";
//    }
      var abbrev_and_county = counties.countiesDict[zip_code];
      var state_abbrev = abbrev_and_county[0];
      console.log (`state_abbrev: ${state_abbrev}`);
      county_name = abbrev_and_county[1];
      console.log (`county_name1: ${county_name1}`);
      state_name = counties.stateAbbrevObject[state_abbrev];

    // agent.add (`I see you are at ${location.formattedAddress}`);
    //        agent.add (`I see you are at ${location.zipCode}`);
    //   agent.add (`I see you are at ${location.zipCode}`);
    // agent.add (`I see you are at zipcode ${zip_code} county ${county_name} state ${state_name}`);


    // county_name = "Rockingham";
    // state_name = "New Hampshire";





    // var today_url_string = '201128';
    var datetime = new Date();
    console.log(datetime);
    var month = datetime.getUTCMonth() + 1; //months from 1-12
    var day = datetime.getUTCDate();
    day = day - 1;    
    var year = datetime.getUTCFullYear();
    year = year.toString().substr(-2);

    var today_url_string = `${year}${month}${day}`;

    console.log (`date: ${today_url_string}`);
    var url1 = `https://covid-counties.s3.amazonaws.com/output/all_counties.txt.${today_url_string}.cases.sorted.json`;
    var url2 = `https://covid-counties.s3.amazonaws.com/output/all_counties.txt.${today_url_string}.deaths.sorted.json`;
    console.log (`url1: ${url1}`);
    console.log (`url2: ${url2}`);
    var returnObj1 = await getMyUrl(url1, county_name, state_name, "cases");
    var returnObj2 = await getMyUrl(url2, county_name, state_name, "deaths");
    console.log(`returnObj1 ${JSON.stringify(returnObj1)}`);
    console.log(`returnObj2 ${JSON.stringify(returnObj2)}`);

    var new_cases = returnObj1.now - returnObj1.wk_ago;
    var new_deaths = returnObj2.now - returnObj2.wk_ago;
    var pretty_month = months[month];
    agent.add (`In ${county_name}, ${state_name}, there were ${new_cases} new cases and ${new_deaths} new deaths during the week leading up to ${pretty_month} ${day}`);
}
else{
   agent.add (`Sorry, I can't do anything if I don't know your location`);
}
  }




   async function get_cases (agent) {
    console.log("Getting cases statistics", {structuredData: true});      
    console.log(`Date is ${datetime}`);
    agent.add(`Getting the cases `); 
    var county_name = "Rockingham";
    var state_name = "New Hampshire";
    // var today_url_string = '201128';
    var datetime = new Date();
    console.log(datetime);
    var month = datetime.getUTCMonth() + 1; //months from 1-12
    var day = datetime.getUTCDate();
    day = day - 1;    
    var year = datetime.getUTCFullYear();
    year = year.toString().substr(-2);

    var today_url_string = `${year}${month}${day}`;

    console.log (`date: ${today_url_string}`);

//    console.log (`agent: ${JSON.stringify(agent)}`);
    var url3 = `https://covid-counties.s3.amazonaws.com/output/all_counties.txt.${today_url_string}.cases.sorted.json`;
    console.log (`url3: ${url3}`);
    var returnObj3 = await getMyUrl(url3, county_name, state_name, "cases");
    console.log(`returnObj3 ${JSON.stringify(returnObj3)}`);

    agent.add (`In ${county_name} County, ${state_name} cases, as of today is ${returnObj3.now}.  Cases one short week ago was ${returnObj3.wk_ago}. `);
  }

   async function get_deaths (agent) {
    console.log("Getting death statistics", {structuredData: true});      agent.add(`Getting the deaths `); 
    var county_name = "Rockingham";
    var state_name = "New Hampshire";
    // var today_url_string = '201210';
    var datetime = new Date();
    console.log(datetime);
    var month = datetime.getUTCMonth() + 1; //months from 1-12
    var day = datetime.getUTCDate();
    day = day - 1;    
    var year = datetime.getUTCFullYear();
    year = year.toString().substr(-2);

    var today_url_string = `${year}${month}${day}`;

    console.log (`date: ${today_url_string}`);

    // console.log (`agent: ${JSON.stringify(agent)}`);
    var url3 = `https://covid-counties.s3.amazonaws.com/output/all_counties.txt.${today_url_string}.deaths.sorted.json`;
    console.log (`url3: ${url3}`);
    var returnObj3 = await getMyUrl(url3, county_name, state_name, "deaths");
    console.log(`returnObj3 ${JSON.stringify(returnObj3)}`);

    agent.add (`In ${county_name} County, ${state_name} deaths, as of today is ${returnObj3.now}.  Deaths one week ago was ${returnObj3.wk_ago}. `);
  }

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

//    async function where_am_i (agent) {
//    agent.add (`You is in Rockingham: ${agent.intent}`);

//}

   async function where_am_iOtherOld (agent) {
     agent.requestSource = agent.ACTIONS_ON_GOOGLE;
     let conv = agent.conv();

     conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
     conv.ask('Hello from the Actions on Google client library!');
     agent.add(conv);
}   

function where_am_iNews(agent) {
    agent.requestSource = agent.ACTIONS_ON_GOOGLE;
     let conv = agent.conv();
    //  conv.ask('Hello from the Actions on Google client library!');
        const permissions = ['NAME'];
       let context = 'To address you by name';
  // Location permissions only work for verified users
  // https://developers.google.com/actions/assistant/guest-users
   if (conv.user.verification === 'VERIFIED') {
    // Could use DEVICE_COARSE_LOCATION instead for city, zip code
    permissions.push('DEVICE_PRECISE_LOCATION');
    context += ' and know your whereabouts';
  }
  const options = {
    context,
    permissions,
  };
  conv.ask(new Permission(options));
   //   agent.add(conv);
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
        // debugger;
        console.log(`calling getCountyInfo(obj, ${county_name}, ${state_name})`);
        county_name = county_name.toLowerCase();
        state_name = state_name.toLowerCase();
        county_name = county_name.replace(' county', '');

        county_name = capitalize(county_name);
        state_name = capitalize(state_name);
        console.log(`now calling getCountyInfo(obj, ${county_name}, ${state_name})`);
        var info = getCountyInfo(obj, county_name, state_name);
        if (info === null){
       return null;
}
        console.log (`info: ${info}`);
        var length = obj.length;
        order = info.order;

        var percentile = Math.round(100 * (order / length));
	    info.percentile = percentile;

        var rate = info.rate;
        var rounded = Math.round(rate);
        console.log(`but how come order is ${order}?`);
        console.log(`got the datastring ${JSON.stringify(info)}`);
        resolve (info);
        // trend_type + ' is ' + order + ' out of ' + length;
     
        var nowNumber = info.now;
        var wkAgoNumber = info.wk_ago;
        var lkBackDiff = parseInt(nowNumber, 10) - parseInt(wkAgoNumber, 10);
        var looking_back_explain = ` There was an increase of ${lkBackDiff} ${trend_type} over the past 7 days.`;
        sayNew = `${county_name} county ${state_name} `;

        var returnObj={};
        if (percentile < 50) {
          sayNew = ` ${sayNew} is in the top ${percentile} per cent, in ${trend_type}.`;
          	returnObj.percentile = `top ${percentile}`;
        } else {
           var backPercentile = 100 - percentile;
          sayNew = ` ${sayNew} is in the bottom  ${backPercentile} per cent in ${trend_type}.`;
          returnObj.percentile = `bottom ${backPercentile}`;	   
        }

        sayNew = sayNew + looking_back_explain;
        // console.log(`sayNew: ${sayNew}`);


	returnObj.county_name= county_name;
	returnObj.state_name= state_name;
	returnObj.trend_type = trend_type;
        returnObj.lkBackDiff = lkBackDiff;
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
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
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
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('get_covid_cases', get_cases);
  intentMap.set('get_covid_deaths', get_deaths);
  intentMap.set('get_covid_stats', get_stats);
  intentMap.set('get_changed_zipcode', get_zipcode);
  // intentMap.set('get_my_location', where_am_i);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
