# homebridge-http-windspeed

This is a copy of http://github.com/epadillac/homebridge-http-lux.git
Huge parts are also copied from homebridge-ws project on github.

Supports http windspeed sensor devices on the Homebridge platform. Additional hardware required.
This is a modified version of the https://github.com/metbosch/homebridge-http-temperature plugin.
This version only supports the windspeed sensor. MAX speed is set to 10000 units.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-http-windspeed
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Configuration


Configuration sample file:

```
"platforms": [
    {
        "platform":      "homebridge-http-windspeed",
        "name":          "Windspeed",
        "host":          "192.168.0.20:8080",
        "path":          "/api/",
        "suffix":        "windspeed",
        "manufacturer":  "your name",
        "model":         "your model",
        "serial":        "12345",
        "timeout":       60,
        "min_windspeed": 1,
        "max_windspeed": 10000
    }
]
```
URL that is generated to download data: http://192.168.0.20:8080/api/windspeed

The defined endpoint will return a json looking like this
```
{
	"windspeed": 50
}
```


This plugin acts as an interface between a web endpoint and homebridge. You will need additional hardware to expose the web endpoints with the wind level information.
