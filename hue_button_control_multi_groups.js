// Script allows to control multiple Philips Hue groups with on button. This example controls two groups in the following logic:
// All off - only first group on - only second group on - both groups on - all off. 
// The current version of the script DOES NOT pull the current state of the lights and OVERRIDES the brightness/hue settings to a default, med brightness

let CONFIG = {
    ip: '192.168.178.70', // Philips Hue Bridge IP
    user: 'RlK5bitLfES0Mk3qB-wa0ezHmFi2e6AqBOg6cxZ3', // Hue Bridge API user token
    group1: '1', // Target Hue group IDs
    group82: '82',
    input1: 0, // Shelly Button ID for triggering the action
    btnevent1: 'single_push', // Event type for the action trigger
    group1_is_on: false,
    group82_is_on: false,
    emulate_state_counter: 0,
    bri: 75,
    hue: 8401,
    sat: 142
};

Shelly.addEventHandler(function(event) {
  if (event.component === "input:0") {
    if (event.info.event === "single_push") {
      print("Button was pushed");
      controlLightGroups();
    }
  }
});

function controlLightGroups() {
  print("Control light groups.")
  
  //Get the state of the first group.
  //Get the state of the second group.
  
  //GET STATE EMULATOR: I define a counter and dial through the group state
  // based on the previous value of the counter.
  CONFIG.emulate_state_counter = CONFIG.emulate_state_counter + 1
  if (CONFIG.emulate_state_counter > 3) {
    CONFIG.emulate_state_counter = 0
  }
  
  if (CONFIG.emulate_state_counter === 0) {
      CONFIG.group1_is_on = false
      CONFIG.group82_is_on = false
  } else if (CONFIG.emulate_state_counter === 1) {
      CONFIG.group1_is_on = true
      CONFIG.group82_is_on = false
  } else if (CONFIG.emulate_state_counter === 2) {
      CONFIG.group1_is_on = false
      CONFIG.group82_is_on = true
  } else if (CONFIG.emulate_state_counter === 3) {
      CONFIG.group1_is_on = true
      CONFIG.group82_is_on = true
  } else {
  
  }
  print(CONFIG.emulate_state_counter)
  
        
  //Control lights, based on the received state.
  if (!CONFIG.group1_is_on && !CONFIG.group82_is_on) {
    toggleLights(CONFIG.group1, true);
    toggleLights(CONFIG.group82, false);
  } else if (CONFIG.group1_is_on && !CONFIG.group82_is_on) {
    toggleLights(CONFIG.group1, false);
    toggleLights(CONFIG.group82, true);  
  } else if (!CONFIG.group1_is_on && CONFIG.group82_is_on) {
    toggleLights(CONFIG.group1, true);
    toggleLights(CONFIG.group82, true);
  } else {
    toggleLights(CONFIG.group1, false);
    toggleLights(CONFIG.group82, false);    
   }
}

// Toggles the state of the specified light group
function toggleLights(group, on) {
    let actionUrl = 'http://' + CONFIG.ip + '/api/' + CONFIG.user + '/groups/' + group + '/action';
    // Added bri, hue, and sat parameters to the body object
    let body = JSON.stringify({
        on: on,
        bri: CONFIG.bri,                   // Brightness, value between 1 and 254
        hue: CONFIG.hue,                 // Hue, value between 0 and 65535
        sat: CONFIG.sat,                  // Saturation, value between 0 and 254
        //effect: 'none',              // ?
		//xy: '[0.4585, 0.4103]',      // Color as array of xy-coordinates.
		//ct: '369',                   // White color temperature, 154 (cold) - 500 (warm).
		//alert: 'none',             // Select flashes the light once, lselect for 10 seconds
		//colormode: 'xy',
        transitiontime: 5
    });
    Shelly.call("http.request", { method: "PUT", url: actionUrl, body: body }, function(res, errorCode, errorMessage) {
        if (errorCode) {
            console.error("Error toggling lights for group " + group + ": ", errorMessage);
        }
    });
}
