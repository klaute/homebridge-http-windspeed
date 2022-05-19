// homebridge-ws/index.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)


'use strict'

const WsPlatform = require('./lib/WsPlatform')
const packageJson = require('./package.json')

module.exports = function (homebridge) {
  WsPlatform.loadPlatform(homebridge, packageJson, 'homebridge-http-weatherstation', WsPlatform)
}
