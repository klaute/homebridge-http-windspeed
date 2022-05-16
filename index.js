var Service, Characteristic;
var request = require('request');

const DEF_MIN_SPEED = 0,
      DEF_MAX_SPEED = 800,
      DEF_TIMEOUT = 5000;

module.exports = function (homebridge) {
   Service = homebridge.hap.Service;
   Characteristic = homebridge.hap.Characteristic;
   homebridge.registerAccessory("homebridge-http-windspeed", "HttpWindspeed", HttpWindspeed);
}


function HttpWindspeed(log, config) {
   this.log = log;

   // url info
   this.url = config["url"];
   this.http_method = config["http_method"] || "GET";
   this.name = config["name"];
   this.manufacturer = config["manufacturer"] || "@klaute";
   this.model = config["model"] || "nodeMCU multi sensor DIY";
   this.serial = config["serial"] || "20220516";
   this.timeout = config["timeout"] || DEF_TIMEOUT;
   this.minLux = config["min_lux"] || DEF_MIN_SPEED;
   this.maxLux = config["max_lux"] || DEF_MAX_SPEED;
}

HttpWindspeed.prototype = {

   getState: function (callback) {
      var ops = {
         uri:    this.url,
         method: this.http_method,
         timeout: this.timeout
      };

      //Parse the request sent via http
      this.log('Requesting windspeed on "' + ops.uri + '", method ' + ops.method);
      request(ops, (error, res, body) => {
         var value = null;
         if (error) {
            this.log('HTTP bad response (' + ops.uri + '): ' + error.message);
         } else {
            try {
               value = JSON.parse(body).windspeed;
               if (value < this.minLux || value > this.maxLux || isNaN(value)) {
                  throw "Invalid value received";
               }
               this.log('HTTP successful response: ' + body);
            } catch (parseErr) {
               this.log('Error processing received information: ' + parseErr.message);
               error = parseErr;
            }
         }
         callback(error, value);
      });
   },

   getServices: function () {
      this.informationService = new Service.AccessoryInformation();
      this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial);

      this.windspeedService = new Service.WindSensor(this.name);
      this.windspeedService
         .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
         .on('get', this.getState.bind(this))
         .setProps({
             minValue: this.minLux,
             maxValue: this.maxLux
         });
      return [this.informationService, this.WindLevelService];
   }
};

