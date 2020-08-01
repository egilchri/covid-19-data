/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//
// Alexa Fact Skill - Sample for Beginners
//

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
// var http = require('http'); 
const https = require('https');

const place_dict = {"03801": {"county_name": "Rockingham","state_name": "New Hampshire"},"92663": {"county_name": "Orange","state_name": "California"}};

const counties = require ('./new_counties5.js');
//const counties = require ('./new_counties_small.js');

console.log (`countiesDict: ${JSON.stringify(counties.countiesDict).length} stateObject: ${JSON.stringify(counties.stateObject).length} stateAbbrevObject: ${JSON.stringify(counties.stateAbbrevObject).length} monthsObject: ${JSON.stringify(counties.monthsObject).length}`);

console.log (`countiesDict: ${JSON.stringify(counties.countiesDict).length}`);
console.log (`stateObject: ${JSON.stringify(counties.stateObject).length}`);
console.log (`stateAbbrevObject: ${JSON.stringify(counties.stateAbbrevObject).length} `);
console.log (`monthsObject: ${JSON.stringify(counties.monthsObject).length} `);




// const request = require ('request');

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
    // checks request type
      return request.type === 'LaunchRequest' ||
	  (request.type === 'IntentRequest' &&
           request.intent.name === 'GetNewFactIntent');
  },
    async  handle(handlerInput) {
	const request = handlerInput.requestEnvelope.request;
	const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

	var speakOutput = 'Covid County reporter.';
	
	var permissions = handlerInput.requestEnvelope.context.System.user.permissions;
	var deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
	var apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
	var apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint;

	console.log (`deviceId is: ${deviceId}`);
	console.log (`apiAccessToken is: ${apiAccessToken}`);
	console.log (`apiEndpoint is: ${apiEndpoint}`);

 	if (permissions){
	    var amazonRequestURL = `${apiEndpoint }/v1/devices/${deviceId}/settings/address/countryAndPostalCode`;
	    console.log (`amazonRequestURL is: ${amazonRequestURL}`);

	    var postalAddressString = await getPostalAddress(amazonRequestURL, apiAccessToken);
	    var postalAddressObj = JSON.parse(postalAddressString);
	    // console.log (`postal message: ${postalAddressObj.message}`);
	    // speakOutput = speakOutput + ' ' + postalAddressObj.message;
	    
	    var zip_code = postalAddressObj.postalCode;
	    // zip_code = '92663';
	    var abbrev_and_county = counties.countiesDict[zip_code];
	    console.log (`zip_code: ${zip_code} abbrev_and_county ${abbrev_and_county}`);
	    // var res = abbrev_and_county.split(",");
	    var state_abbrev = abbrev_and_county[0];
	    var county_name = abbrev_and_county[1];

	    var state_name = counties.stateAbbrevObject[state_abbrev];
	    // speakOutput = speakOutput + ' ' + ' I know where you live';
	    // speakOutput = speakOutput + ' ' + ` Your postal code is ${postalAddressObj.postalCode}`;
	    // var county_name = 'Rockingham';
	    // var state_name = 'New Hampshire';
	    console.log(`cty_name: ${county_name} ste_name: ${state_name}`);

	    var countyPop = counties.countyPopsObject[state_name][county_name];
            if (typeof countyPop === "undefined"){
		countyPop = "1";
	    }
	    // var countPop = '2';
	    console.log (`countyPop for ${state_name} ${county_name} is ${countyPop}`);
	    var sayNew1 = await handleStateWithCounty(handlerInput, state_name, county_name);
            // speakOutput = speakOutput + " " + sayNew1;
            speakOutput = speakOutput + " " + "I believe you are in " + county_name + ", "+ state_name + "with population " + countyPop + ". " + sayNew1;

   return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      // .shouldEndSession(requestAttributes.t(false))
      .addDelegateDirective({
        name: 'GetStateAndLaunch',
        confirmationStatus: 'NONE',
        slots: {}
      })
      .getResponse();
	}
	else{
	    console.log (`User hasn't granted any permissions yet`);

            const permissions = ['read::alexa:device:all:address:country_and_postal_code'];
            return handlerInput.responseBuilder
		.speak('Please grant skill permissions to access your device address.')
	    .withAskForPermissionsConsentCard(permissions)
	          .getResponse();

	}

      
   return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      // .shouldEndSession(requestAttributes.t(false))
      .addDelegateDirective({
        name: 'GetStateAndLaunch',
        confirmationStatus: 'NONE',
        slots: {}
      })
      .getResponse();
  },
};

const NationalOverview_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'  &&
        request.intent.name === 'national_overview';
  },

 async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
 
    console.log (`In NationalOverview_Handler now`);

     var sayNew = 'Here are the hardest hit counties.';

     for (i = 0; i < 5; i++) {
	 var datePart = getDatePart(i);
	 var url1 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.' + datePart + '.cases' + '.sorted.json';
	 var url2 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.' + datePart + '.deaths' + '.sorted.json';

	 console.log(`url1 is really ${url1}`);
	 console.log(`url2 is really ${url2}`);

      
	 console.log (`time for url1: ${url1}`);
	 var caseHotSpotArray = await getHotspots(url1, "cases");
	 console.log (`I say caseHotSpotArray  is ${JSON.stringify(caseHotSpotArray)}`);
	 console.log (`time for url2: ${url2}`);

	 if (isEmpty(caseHotSpotArray)){
	     console.log (`Came up empty: ${url1}`);
	     continue;
	 }

	 var deathHotSpotArray = await getHotspots(url2, "deaths");
	 console.log (`I say deathHotSpotArray  is ${JSON.stringify(deathHotSpotArray)}`);

     if (isEmpty(deathHotSpotArray)){
	 console.log (`Came up empty: ${url1}`);
	 continue;
     }

	 var monthNum = datePart.substring(2,4);
	 var prettyMonth = counties.monthsObject[monthNum];

	 var prettyDate = `${prettyMonth} ${datePart.substring(4,6)}`;


	 sayNew = sayNew + ' For deaths, we have these counties';
	 for (var i = 0; i < deathHotSpotArray.length; i++) {
	     var element = deathHotSpotArray[i];
	     sayNew = sayNew + ' ' + element;
	 }
    	 sayNew = sayNew + ' And for cases, we have these counties:';
	 for (var i = 0; i < caseHotSpotArray.length; i++) {
	     var element = caseHotSpotArray[i];
	     sayNew = sayNew + ' ' + element;
	 }

	 var intentName = 'GetStateAndLaunch';
     
    return responseBuilder
      // .speak(say)
      .speak(sayNew)

//       .addDelegateDirective({
//        name: intentName,
//        confirmationStatus: 'NONE',
//        slots: {}
//      })

     .getResponse();

     }
 }
}

const GetStateAndLaunch_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'  &&
        request.intent.name === 'GetStateAndLaunch';
  },

 async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
 
    console.log (`In GetStateAndLaunch_Handler now`);
    var twople = get_state(request);
      var this_state = twople['state_name'];
      var sayNew = 'Ok, for ' + this_state + ' we have ';
     console.log (`state is ${this_state}`);
     var abbrev = stateObject[this_state];
     abbrev = abbrev.toUpperCase();
     console.log (`abbrev is ${abbrev}`);
     // GetCOUpdateIntent
     var intentName = 'Get' + abbrev + 'UpdateIntent';
    return responseBuilder
      // .speak(say)
      .speak(sayNew)

       .addDelegateDirective({
        name: intentName,
        confirmationStatus: 'NONE',
        slots: {}
      })

     .getResponse();

  }
}


const GetUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetUpdateIntent';
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var twople = get_county_and_state(request);
    var county_name = twople.my_county;
    var state_name = twople.my_state;

    var datePart = getDatePart(0);

    // this is the json we need to consult
    // https://covid-counties.s3.amazonaws.com/output/all_counties.txt.200525.cases.sorted.json

    var url1 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.' + datePart + '.cases' + '.sorted.json';
    var url2 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.' + datePart + '.deaths' + '.sorted.json';

    console.log(`url1 is ${url1}`);
    console.log(`url2 is ${url2}`);

    var sayNew1 = await getMyUrl(url1, county_name, state_name, "cases");
    var sayNew2 = await getMyUrl(url2, county_name, state_name, "deaths");
    // var sayNew = 'Howdy';
    var sayNew = sayNew1 + ' ' + sayNew2;
      console.log (`What I'm going to say is ${sayNew}`);

    return handlerInput.responseBuilder
      // .speak(say)
      .speak(sayNew)
      .reprompt('try again, ' + sayNew)
      .getResponse();

  }
}

/* State Update Handlers */


const GetCAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetCAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ca", "California");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetALUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetALUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "al", "Alabama");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetAKUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetAKUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ak", "Alaska");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetASUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetASUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "as", "American Samoa");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetAZUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetAZUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "az", "Arizona");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetARUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetARUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ar", "Arkansas");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}


const GetCOUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetCOUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "co", "Colorado");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetCTUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetCTUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ct", "Connecticut");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetDEUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetDEUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "de", "Delaware");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetDCUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetDCUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "dc", "District of Columbia");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetFLUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetFLUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "fl", "Florida");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetGAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetGAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ga", "Georgia");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetGUUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetGUUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "gu", "Guam");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetHIUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetHIUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "hi", "Hawaii");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetIDUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetIDUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "id", "Idaho");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetILUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetILUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "il", "Illinois");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetINUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetINUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "in", "Indiana");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetIAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetIAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ia", "Iowa");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetKSUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetKSUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ks", "Kansas");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetKYUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetKYUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ky", "Kentucky");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetLAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetLAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "la", "Louisiana");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMEUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMEUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "me", "Maine");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMDUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMDUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "md", "Maryland");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ma", "Massachusetts");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMIUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMIUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "mi", "Michigan");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMNUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMNUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "mn", "Minnesota");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMSUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMSUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ms", "Mississippi");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMOUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMOUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "mo", "Missouri");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMTUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMTUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "mt", "Montana");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNEUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNEUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ne", "Nebraska");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNHUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNHUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "nh", "New Hampshire");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNVUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNVUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "nv", "Nevada");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNJUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNJUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "nj", "New Jersey");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNMUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNMUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "nm", "New Mexico");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNYUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNYUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ny", "New York");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNCUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNCUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "nc", "North Carolina");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetNDUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetNDUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "nd", "North Dakota");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetMPUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetMPUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "mp", "Northern Mariana is");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetOHUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetOHUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "oh", "Ohio");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetOKUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetOKUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ok", "Oklahoma");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetORUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetORUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "or", "Oregon");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetPAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetPAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "pa", "Pennsylvania");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetPRUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetPRUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "pr", "Puerto Rico");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetRIUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetRIUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ri", "Rhode Island");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetSCUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetSCUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "sc", "South Carolina");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetSDUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetSDUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "sd", "South Dakota");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetTNUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetTNUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "tn", "Tennessee");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetTXUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetTXUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "tx", "Texas");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetUTUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetUTUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "ut", "Utah");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetVTUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetVTUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "vt", "Vermont");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetVAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetVAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "va", "Virginia");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetVIUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetVIUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "vi", "Virgin islands");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetWAUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetWAUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "wa", "Washington");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetWVUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetWVUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "wv", "West Virginia");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetWIUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetWIUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "wi", "Wisconsin");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

const GetWYUpdateIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetWYUpdateIntent';
  },
  async handle(handlerInput) {
      var sayNew = await handleState(handlerInput, "wy", "Wyoming");
      console.log (`I say sayNew is ${sayNew}`);
      return handlerInput.responseBuilder
       .speak(sayNew)
      .getResponse();
  }
}

/* end State Update Handlers */


const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    GetStateAndLaunch_Handler,
    GetUpdateIntent_Handler,
      GetCAUpdateIntent_Handler,
      GetALUpdateIntent_Handler,
      GetAKUpdateIntent_Handler,
      GetASUpdateIntent_Handler,
      GetAZUpdateIntent_Handler,
      GetARUpdateIntent_Handler,
      GetCOUpdateIntent_Handler,
      GetCTUpdateIntent_Handler,
      GetDEUpdateIntent_Handler,
      GetDCUpdateIntent_Handler,
      GetFLUpdateIntent_Handler,
      GetGAUpdateIntent_Handler,
      GetGUUpdateIntent_Handler,
      GetHIUpdateIntent_Handler,
      GetIDUpdateIntent_Handler,
      GetILUpdateIntent_Handler,
      GetINUpdateIntent_Handler,
      GetIAUpdateIntent_Handler,
      GetKSUpdateIntent_Handler,
      GetKYUpdateIntent_Handler,
      GetLAUpdateIntent_Handler,
      GetMEUpdateIntent_Handler,
      GetMDUpdateIntent_Handler,
      GetMAUpdateIntent_Handler,
      GetMIUpdateIntent_Handler,
      GetMNUpdateIntent_Handler,
      GetMSUpdateIntent_Handler,
      GetMOUpdateIntent_Handler,
      GetMTUpdateIntent_Handler,
      GetNEUpdateIntent_Handler,
      GetNHUpdateIntent_Handler,
      GetNVUpdateIntent_Handler,
      GetNJUpdateIntent_Handler,
      GetNMUpdateIntent_Handler,
      GetNYUpdateIntent_Handler,
      GetNCUpdateIntent_Handler,
      GetNDUpdateIntent_Handler,
      GetMPUpdateIntent_Handler,
      GetOHUpdateIntent_Handler,
      GetOKUpdateIntent_Handler,
      GetORUpdateIntent_Handler,
      GetPAUpdateIntent_Handler,
      GetPRUpdateIntent_Handler,
      GetRIUpdateIntent_Handler,
      GetSCUpdateIntent_Handler,
      GetSDUpdateIntent_Handler,
      GetTNUpdateIntent_Handler,
      GetTXUpdateIntent_Handler,
      GetUTUpdateIntent_Handler,
      GetVTUpdateIntent_Handler,
      GetVAUpdateIntent_Handler,
      GetVIUpdateIntent_Handler,
      GetWAUpdateIntent_Handler,
      GetWVUpdateIntent_Handler,
      GetWIUpdateIntent_Handler,
      GetWYUpdateIntent_Handler,
      NationalOverview_Handler,
      SessionEndedRequestHandler,

  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();

// TODO: Replace this data with your own.
// It is organized by language/locale.  You can safely ignore the locales you aren't using.
// Update the name and messages to align with the theme of your skill

const deData = {
  translation: {
    SKILL_NAME: 'Weltraumwissen',
    GET_FACT_MESSAGE: 'Hier sind deine Fakten: ',
    HELP_MESSAGE: 'Du kannst sagen, „Nenne mir einen Fakt über den Weltraum“, oder du kannst „Beenden“ sagen... Wie kann ich dir helfen?',
    HELP_REPROMPT: 'Wie kann ich dir helfen?',
    FALLBACK_MESSAGE: 'Die Weltraumfakten Skill kann dir dabei nicht helfen. Sie kann dir Fakten über den Raum erzählen, wenn du dannach fragst.',
    FALLBACK_REPROMPT: 'Wie kann ich dir helfen?',
    ERROR_MESSAGE: 'Es ist ein Fehler aufgetreten.',
    STOP_MESSAGE: 'Auf Wiedersehen!',
    FACTS: [
      'Ein Jahr dauert auf dem Merkur nur 88 Tage.',
      'Die Venus ist zwar weiter von der Sonne entfernt, hat aber höhere Temperaturen als Merkur.',
      'Venus dreht sich entgegen dem Uhrzeigersinn, möglicherweise aufgrund eines früheren Zusammenstoßes mit einem Asteroiden.',
      'Auf dem Mars erscheint die Sonne nur halb so groß wie auf der Erde.',
      'Jupiter hat den kürzesten Tag aller Planeten.',
    ],
  },
};

const dedeData = {
  translation: {
    SKILL_NAME: 'Weltraumwissen auf Deutsch',
  },
};

const enData = {
  translation: {
    SKILL_NAME: 'Space Facts',
    GET_FACT_MESSAGE: 'Here\'s your fact: ',
    HELP_MESSAGE: 'You can say tell me a space fact, or, you can say exit... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    FALLBACK_MESSAGE: 'The Space Facts skill can\'t help you with that.  It can help you discover facts about space if you say tell me a space fact. What can I help you with?',
    FALLBACK_REPROMPT: 'What can I help you with?',
    ERROR_MESSAGE: 'Sorry, an error occurred.',
    STOP_MESSAGE: 'Goodbye!',
    FACTS: [
      'A year on Mercury is just 88 days long.',
      'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
      'On Mars, the Sun appears about half the size as it does on Earth.',
      'Jupiter has the shortest day of all the planets.',
      'The Sun is an almost perfect sphere.',
    ],
  },
};

const enauData = {
  translation: {
    SKILL_NAME: 'Australian Space Facts',
  },
};

const encaData = {
  translation: {
    SKILL_NAME: 'Canadian Space Facts',
  },
};

const engbData = {
  translation: {
    SKILL_NAME: 'British Space Facts',
  },
};

const eninData = {
  translation: {
    SKILL_NAME: 'Indian Space Facts',
  },
};

const enusData = {
  translation: {
    SKILL_NAME: 'American Space Facts',
  },
};

const esData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio',
    GET_FACT_MESSAGE: 'Aquí está tu curiosidad: ',
    HELP_MESSAGE: 'Puedes decir dime una curiosidad del espacio o puedes decir salir... Cómo te puedo ayudar?',
    HELP_REPROMPT: 'Como te puedo ayudar?',
    FALLBACK_MESSAGE: 'La skill Curiosidades del Espacio no te puede ayudar con eso.  Te puede ayudar a descubrir curiosidades sobre el espacio si dices dime una curiosidad del espacio. Como te puedo ayudar?',
    FALLBACK_REPROMPT: 'Como te puedo ayudar?',
    ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
    STOP_MESSAGE: 'Adiós!',
    FACTS: [
      'Un año en Mercurio es de solo 88 días',
      'A pesar de estar más lejos del Sol, Venus tiene temperaturas más altas que Mercurio',
      'En Marte el sol se ve la mitad de grande que en la Tierra',
      'Jupiter tiene el día más corto de todos los planetas',
      'El sol es una esféra casi perfecta',
    ],
  },
};

const esesData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para España',
  },
};

const esmxData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para México',
  },
};

const esusData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para Estados Unidos',
  },
};

const frData = {
  translation: {
    SKILL_NAME: 'Anecdotes de l\'Espace',
    GET_FACT_MESSAGE: 'Voici votre anecdote : ',
    HELP_MESSAGE: 'Vous pouvez dire donne-moi une anecdote, ou, vous pouvez dire stop... Comment puis-je vous aider?',
    HELP_REPROMPT: 'Comment puis-je vous aider?',
    FALLBACK_MESSAGE: 'La skill des anecdotes de l\'espace ne peux vous aider avec cela. Je peux vous aider à découvrir des anecdotes sur l\'espace si vous dites par exemple, donne-moi une anecdote. Comment puis-je vous aider?',
    FALLBACK_REPROMPT: 'Comment puis-je vous aider?',
    ERROR_MESSAGE: 'Désolé, une erreur est survenue.',
    STOP_MESSAGE: 'Au revoir!',
    FACTS: [
      'Une année sur Mercure ne dure que 88 jours.',
      'En dépit de son éloignement du Soleil, Vénus connaît des températures plus élevées que sur Mercure.',
      'Sur Mars, le Soleil apparaît environ deux fois plus petit que sur Terre.',
      'De toutes les planètes, Jupiter a le jour le plus court.',
      'Le Soleil est une sphère presque parfaite.',
    ],
  },
};

const frfrData = {
  translation: {
    SKILL_NAME: 'Anecdotes françaises de l\'espace',
  },
};

const frcaData = {
  translation: {
    SKILL_NAME: 'Anecdotes canadiennes de l\'espace',
  },
};

const hiData = {
  translation: {
    SKILL_NAME: 'अंतरिक्ष facts',
    GET_FACT_MESSAGE: 'ये लीजिए आपका fact: ',
    HELP_MESSAGE: 'आप मुझे नया fact सुनाओ बोल सकते हैं या फिर exit भी बोल सकते हैं... आप क्या करना चाहेंगे?',
    HELP_REPROMPT: 'मैं आपकी किस प्रकार से सहायता कर सकती हूँ?',
    ERROR_MESSAGE: 'सॉरी, मैं वो समज नहीं पायी. क्या आप repeat कर सकते हैं?',
    STOP_MESSAGE: 'अच्छा bye, फिर मिलते हैं',
    FACTS: [
      'बुध गृह में एक साल में केवल अठासी दिन होते हैं',
      'सूरज से दूर होने के बावजूद, Venus का तापमान Mercury से ज़्यादा होता हैं',
      'Earth के तुलना से Mars में सूरज का size तक़रीबन आधा हैं',
      'सारे ग्रहों में Jupiter का दिन सबसे कम हैं',
      'सूरज का shape एकदम गेंद आकार में हैं'
    ],
  },
};

const hiinData = {
  translation: {
    SKILL_NAME: 'अंतरिक्ष फ़ैक्ट्स',
  },
}

const itData = {
  translation: {
    SKILL_NAME: 'Aneddoti dallo spazio',
    GET_FACT_MESSAGE: 'Ecco il tuo aneddoto: ',
    HELP_MESSAGE: 'Puoi chiedermi un aneddoto dallo spazio o puoi chiudermi dicendo "esci"... Come posso aiutarti?',
    HELP_REPROMPT: 'Come posso aiutarti?',
    FALLBACK_MESSAGE: 'Non posso aiutarti con questo. Posso aiutarti a scoprire fatti e aneddoti sullo spazio, basta che mi chiedi di dirti un aneddoto. Come posso aiutarti?',
    FALLBACK_REPROMPT: 'Come posso aiutarti?',
    ERROR_MESSAGE: 'Spiacenti, si è verificato un errore.',
    STOP_MESSAGE: 'A presto!',
    FACTS: [
      'Sul pianeta Mercurio, un anno dura solamente 88 giorni.',
      'Pur essendo più lontana dal Sole, Venere ha temperature più alte di Mercurio.',
      'Su Marte il sole appare grande la metà che su la terra. ',
      'Tra tutti i pianeti del sistema solare, la giornata più corta è su Giove.',
      'Il Sole è quasi una sfera perfetta.',
    ],
  },
};

const ititData = {
  translation: {
    SKILL_NAME: 'Aneddoti dallo spazio',
  },
};

const jpData = {
  translation: {
    SKILL_NAME: '日本語版豆知識',
    GET_FACT_MESSAGE: '知ってましたか？',
    HELP_MESSAGE: '豆知識を聞きたい時は「豆知識」と、終わりたい時は「おしまい」と言ってください。どうしますか？',
    HELP_REPROMPT: 'どうしますか？',
    ERROR_MESSAGE: '申し訳ありませんが、エラーが発生しました',
    STOP_MESSAGE: 'さようなら',
    FACTS: [
      '水星の一年はたった88日です。',
      '金星は水星と比べて太陽より遠くにありますが、気温は水星よりも高いです。',
      '金星は反時計回りに自転しています。過去に起こった隕石の衝突が原因と言われています。',
      '火星上から見ると、太陽の大きさは地球から見た場合の約半分に見えます。',
      '木星の<sub alias="いちにち">1日</sub>は全惑星の中で一番短いです。',
      '天の川銀河は約50億年後にアンドロメダ星雲と衝突します。',
    ],
  },
};

const jpjpData = {
  translation: {
    SKILL_NAME: '日本語版豆知識',
  },
};

const ptbrData = {
  translation: {
    SKILL_NAME: 'Fatos Espaciais',
  },
};

const ptData = {
  translation: {
    SKILL_NAME: 'Fatos Espaciais',
    GET_FACT_MESSAGE: 'Aqui vai: ',
    HELP_MESSAGE: 'Você pode me perguntar por um fato interessante sobre o espaço, ou, fexar a skill. Como posso ajudar?',
    HELP_REPROMPT: 'O que vai ser?',
    FALLBACK_MESSAGE: 'A skill fatos espaciais não tem uma resposta para isso. Ela pode contar informações interessantes sobre o espaço, é só perguntar. Como posso ajudar?',
    FALLBACK_REPROMPT: 'Eu posso contar fatos sobre o espaço. Como posso ajudar?',
    ERROR_MESSAGE: 'Desculpa, algo deu errado.',
    STOP_MESSAGE: 'Tchau!',
    FACTS: [
      'Um ano em Mercúrio só dura 88 dias.',
      'Apesar de ser mais distante do sol, Venus é mais quente que Mercúrio.',
      'Visto de marte, o sol parece ser metade to tamanho que nós vemos da terra.',
      'Júpiter tem os dias mais curtos entre os planetas no nosso sistema solar.',
      'O sol é quase uma esfera perfeita.',
    ],
  },
};

// constructs i18n and l10n data structure
const languageStrings = {
  'de': deData,
  'de-DE': dedeData,
  'en': enData,
  'en-AU': enauData,
  'en-CA': encaData,
  'en-GB': engbData,
  'en-IN': eninData,
  'en-US': enusData,
  'es': esData,
  'es-ES': esesData,
  'es-MX': esmxData,
  'es-US': esusData,
  'fr': frData,
  'fr-FR': frfrData,
  'fr-CA': frcaData,
  'hi': hiData,
  'hi-IN': hiinData,
  'it': itData,
  'it-IT': ititData,
  'ja': jpData,
  'ja-JP': jpjpData,
  'pt': ptData,
  'pt-BR': ptbrData,
};

function getSlotValues(filledSlots) {
  const slotValues = {};

  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            ERstatus: 'ER_SUCCESS_MATCH'
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved: '',
            ERstatus: 'ER_SUCCESS_NO_MATCH'
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        heardAs: filledSlots[item].value,
        resolved: '',
        ERstatus: ''
      };
    }
  }, this);

  return slotValues;
}

function get_county_and_state(request) {
  const twople = {};

  let found_county_name = '';
  let found_state_name = '';
  let say = 'Hello from GetCaseRateIntent. ';

  let slotStatus = '';
  let resolvedSlot;

  let slotValues = getSlotValues(request.intent.slots);
  // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

  // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
  //   SLOT: county_name 
  if (slotValues.my_county.heardAs) {
    // slotStatus += ' slot county_name was heard as ' + slotValues.county_name.heardAs + '. ';
  } else {
    slotStatus += 'slot my_county is empty. ';
  }
  if (slotValues.my_county.ERstatus === 'ER_SUCCESS_MATCH') {
    slotStatus += 'a valid ';
    found_county_name = slotValues.my_county.heardAs
    twople["my_county"] = found_county_name;
    if (slotValues.my_county.resolved !== slotValues.my_county.heardAs) {
      slotStatus += 'synonym for ' + slotValues.my_county.resolved + '. ';
    } else {
      slotStatus += 'match. '
    } // else {
    //
  }
  if (slotValues.my_county.ERstatus === 'ER_SUCCESS_NO_MATCH') {
    slotStatus += 'which did not match any slot value. ';
    console.log('***** consider adding "' + slotValues.my_county.heardAs + '" to the custom slot type used by slot my_county! ');
  }

  if ((slotValues.my_county.ERstatus === 'ER_SUCCESS_NO_MATCH') || (!slotValues.my_county.heardAs)) {}
  //   SLOT: my_state 
  if (slotValues.my_state.heardAs) {
    slotStatus += ' slot my_state was heard as ' + slotValues.my_state.heardAs + '. ';
  } else {
    slotStatus += 'slot my_state is empty. ';
  }
  if (slotValues.my_state.ERstatus === 'ER_SUCCESS_MATCH') {
    slotStatus += 'a valid ';
    found_state_name = slotValues.my_state.heardAs
    twople["my_state"] = found_state_name;
    if (slotValues.my_state.resolved !== slotValues.my_state.heardAs) {
      slotStatus += 'synonym for ' + slotValues.my_state.resolved + '. ';
    } else {
      slotStatus += 'match. '
    } // else {
    //
  }
  if (slotValues.my_state.ERstatus === 'ER_SUCCESS_NO_MATCH') {
    slotStatus += 'which did not match any slot value. ';
    console.log('***** consider adding "' + slotValues.my_state.heardAs + '" to the custom slot type used by slot my_state! ');
  }

  if ((slotValues.my_state.ERstatus === 'ER_SUCCESS_NO_MATCH') || (!slotValues.my_state.heardAs)) {

  }

  say += slotStatus;

  return twople;


}


function get_county(request, state_abbrev) {
  const twople = {};

  let found_county_name = '';
  let found_state_name = '';
  let say = 'Hello from GetCaseRateIntent. ';

  let slotStatus = '';
  let resolvedSlot;

  let slotValues = getSlotValues(request.intent.slots);
 
  console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
  //   SLOT: county_name 


  var name = 'my_' + state_abbrev + '_county';
    console.log (`name I will use for county slot is ${name}`);
  found_county_name = slotValues[name]['heardAs'];
  twople["county_name"] = found_county_name;

  return twople;

}


function get_state(request) {
  const twople = {};

  let found_county_name = '';
  let found_state_name = '';

  let slotStatus = '';
  let resolvedSlot;

  let slotValues = getSlotValues(request.intent.slots);
 
  console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
  //   SLOT: county_name 

    var name = 'my_state';
    found_state_name = slotValues[name]['resolved'];
  twople["state_name"] = found_state_name;

 console.log (`twople is ${JSON.stringify (twople, null, 2)}`);
  return twople;

}

function getDatePart(fudgeFactor) {
  console.log("TIMEZONE: " + process.env.TZ);
  var dateObj = new Date();
  var month = dateObj.getMonth() + 1; //months from 1-12
  if (parseInt(month, 10) < 10) {
    month = '0' + month;
  }
  var day = dateObj.getDate();
  // day = day -3;
  day = day - fudgeFactor;
  // var year = dateObj.getFullYear()toString().substr(-2);
  if (parseInt(day, 10) < 10) {
    day = '0' + day;
  }
  var year = dateObj.getFullYear().toString().substr(-2);

  var newdate = year + month + day;
  return newdate;
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
    if ((element.county.toLowerCase() == county.toLowerCase()) &&
      (element.state.toLowerCase() == state.toLowerCase())) {
      found = element;
    }
  }

  return found;
}

/**
 * Capitalizes first letters of words in string.
 * @param {string} str String to be modified
 * @param {boolean=false} lower Whether all other letters should be lowercased
 * @return {string}
 * @usage
 *   capitalize('fix this string');     // -> 'Fix This String'
 *   capitalize('javaSCrIPT');          // -> 'JavaSCrIPT'
 *   capitalize('javaSCrIPT', true);    // -> 'Javascript'
 */
const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());;


async function getHotspots(url, trend_type){
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
console.log (`Oh my gosh`);
     resolve ({});
     // return;
}
        var length = obj.length;
        // this is where I should build an array with the top 10 
        // county, state pairs in obj

        var returnObj = [];
        for (var i = 0; i < 5; i++) {
            var element = obj[i];
            var etype = typeof(element);
	    // var element = JSON.parse(element_string);
            console.log (`element: ${JSON.stringify(element)}`);
      var county, state;
      try{
           county = element['county'];
           state = element['state'];
      }
     catch(e){
        console.log (`Oh my gosh: ${e.message}`);
}
 
            // var state = element['state'];
            returnObj.push (`${county} county, ${state}.`);
}



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
console.log (`Oh my gosh`);
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
        if (info == null){
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

async function getPostalAddress(amazonRequestURL, apiAccessToken) {
      let options = { method: 'GET', uri: amazonRequestURL,
		      headers:
		      { 'Authorization': `Bearer ${apiAccessToken}` },
		      json: true // Automatically stringifies the body to JSON
		    };
  return new Promise(function (resolve, reject) {
    let dataString = '';

    try{
    const req = https.get(amazonRequestURL, options, function (res) {
      res.on('data', chunk => {
        dataString += chunk;
      });
      res.on('end', () => {
      console.log (`dataString is ${dataString}`);
        resolve(dataString);
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


async function handleState (handlerInput, abbrev, state){

    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      var twople = get_county(request, abbrev);
    var county_name = twople.county_name;
    var state_name = state;

    console.log (`Officially abbrev ${abbrev} state ${state} county_name ${county_name}`);

    var sayNew = await handleStateWithCountyLow (handlerInput, state_name, county_name);
  return Promise.resolve(sayNew);

}



async function handleStateWithCounty (handlerInput, state, county){

    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var county_name = county;
    var state_name = state;

    console.log (`Officially state_name ${state} county_name ${county_name}`);

    var sayNew = await handleStateWithCountyLow (handlerInput, state_name, county_name);
  return Promise.resolve(sayNew);
}

async function handleStateWithCountyLow (handlerInput, state_name, county_name){

    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // We may not have today's results from NYT yet
    for (i = 0; i < 5; i++) {
    var datePart = getDatePart(i);

    // this is the json we need to consult
    // https://covid-counties.s3.amazonaws.com/output/all_counties.txt.200525.cases.sorted.json

    var url1 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.' + datePart + '.cases' + '.sorted.json';
    var url2 = 'https://covid-counties.s3.amazonaws.com/output/all_counties.txt.' + datePart + '.deaths' + '.sorted.json';

    console.log(`url1 is really ${url1}`);
    console.log(`url2 is really ${url2}`);
    var sayNew1 = '';
    var sayNew2 = '';
      
     console.log (`time for url1: ${url1}`);
     var returnObj1 = await getMyUrl(url1, county_name, state_name, "cases");
     console.log (`I say returnObj1 is ${returnObj1}`);
     if (isEmpty(returnObj1)){
console.log (`Came up empty: ${url1}`);
continue;
}
     console.log (`time for url2: ${url2}`);
     var returnObj2 = await getMyUrl(url2, county_name, state_name, "deaths");

     console.log (`I say returnObj2 is ${JSON.stringify(returnObj2)}`);
     if (isEmpty(returnObj2)){
console.log (`Came up empty: ${url2}`);
continue;
}

    var monthNum = datePart.substring(2,4);
    var prettyMonth = counties.monthsObject[monthNum];

    var prettyDate = `${prettyMonth} ${datePart.substring(4,6)}`;


    // var sayNew = 'Howdy';

    //     var sayNew = `I can report on ${prettyDate} that ${sayNew1} ${sayNew2}`;
    // var sayNew = {};
    console.log (`returnObj1: ${JSON.stringify(returnObj1)}`);
    console.log (`returnObj2: ${JSON.stringify(returnObj2)}`);
//    var sayNew = `As of ${prettyDate}, I can report that  there has been an increase of  ${returnObj1['lkBackDiff']} ${returnObj1['trend_type']}  and an increase of  ${returnObj2['lkBackDiff']} ${returnObj2['trend_type']} over the previous week.  Over the course of the pandemic, for ${returnObj1['trend_type']} , ${returnObj1['county_name']} County, ${returnObj1['state_name']} was in the ${returnObj1['percentile']} percent and for ${returnObj2['trend_type']} it was in the ${returnObj2['percentile']} percent nationwide. `;
    
//    var sayNew = `As of ${prettyDate}, I can report that  there has been an increase of  ${returnObj1['lkBackDiff']} ${returnObj1['trend_type']}  and an increase of  ${returnObj2['lkBackDiff']} ${returnObj2['trend_type']} over the previous week. `;
    var percentile1Phrase;
    var percentile1 = returnObj1['percentile'];
    var backPercentile1 = returnObj1['backPercentile'];

    if (percentile1){
           percentile1Phrase = ` putting it in the  ${percentile1} per cent, nationwide.`
     }
    if (backPercentile1){
           percentile1Phrase = ` putting it in the  ${backPercentile1} per cent, nationwide.`
     }

    var percentile2Phrase;
    var percentile2 = returnObj2['percentile'];
    var backPercentile2 = returnObj2['backPercentile'];

    if (percentile2){
           percentile2Phrase = ` putting it in the  ${percentile2} per cent, nationwide.`
     }
    if (backPercentile2){
           percentile2Phrase = ` putting it in the  ${backPercentile2} per cent, nationwide.`
     }

    var sayNew = `As of ${prettyDate}, I can report that over the previous week, there has been an increase of  ${returnObj1['lkBackDiff']} ${returnObj1['trend_type']}, ${percentile1Phrase}. There has been an increase of  ${returnObj2['lkBackDiff']} ${returnObj2['trend_type']}, ${percentile2Phrase}.`;
   // var sayNew = `I can report that on ${prettyDate}`;



      console.log (`What I'm going to say from handleState is ${sayNew}`);
    return Promise.resolve(sayNew);
 }

}



function isEmpty(obj) {
    if (Object.keys(obj).length === 0 && obj.constructor === Object){
	return true;
    }
    return false;
}

function get_city_state(zip_code){
   return place_dict[zip_code];

}

