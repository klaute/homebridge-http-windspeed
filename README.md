# homebridge-http-lux2

This is a copy of http://github.com/epadillac/homebridge-http-lux.git
Huge parts are also copied from homebridge-ws project on github.

Supports http ambient light sensor devices on the Homebridge platform. Additional hardware required.
This is a modified version of the https://github.com/metbosch/homebridge-http-temperature plugin.
This version only supports the light sensor. MAX lightlevel is set to 800.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-http-lux2
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Configuration


Configuration sample file:

 ```
 "accessories": [
     {
         "accessory": "homebridge-http-windspeed",
         "name": "Windspeed",
         "host": "192.168.0.20:8",
         "path": "/api/windspeed",
         "timeout": 60,
     }
 ]

```


The defined endpoint will return a json looking like this
```
{
	"windspeed": 5
}
```


This plugin acts as an interface between a web endpoint and homebridge. You will need additional hardware to expose the web endpoints with the wind level information.
