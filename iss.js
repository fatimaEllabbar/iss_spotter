/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      callback(error,null);
      return;
    } else if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    } else {
      const data = JSON.parse(body);
      callback(null,data.ip);
      return;
    }
  });
};
const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
      return;
    }
    if (JSON.parse(body).data !== null && JSON.parse(body).data !== undefined) {
      const { latitude, longitude } = JSON.parse(body).data;
      callback(null, {latitude,longitude });
    }
  });
};
const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callback(error,null);
      return;
    } else if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching ISSFlyOver Response: ${body}`;
      callback(Error(msg), null);
      return;
    } else {
      const passTimes = JSON.parse(body).response;
      callback(null, passTimes);
      return;
    }
  });
};
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      callback(error,null);
      return;
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        callback(error,null);
        return;
    }

    fetchISSFlyOverTimes(coords, (error, passTimes) => {
        if (error) {
          callback(error,null);
          return;
        }
         callback(null,passTimes);
      });
    });
 });
}


module.exports = { nextISSTimesForMyLocation };
