/**
 * nodejs module for controlling ETH-RLY16 card of Devantech Ltd
 *
 * @date: 03.05.2013
 * @author: mail@jochen-weber.net
 */


/**
 * npm requirements
 */
var net = require('net');


var EthRly16 = null;


(function () {

    "use strict";


    /**
     * constructor
     *
     * @param oParams
     * @constructor
     */
    EthRly16 = function (oParams) {
        var self = this;

        // default Connection-Parameters
        this.host = "127.0.0.1";
        this.port = 17494;
        this.countRelays = 8;
        this.iGetStateIntervalTimeout = 2000;

        // werte aus uebergebener config
        if (oParams.host !== undefined)
            this.host = oParams.host;
        if (oParams.port !== undefined)
            this.port = oParams.port;
        if (oParams.countRelays !== undefined)
            this.countRelays = oParams.countRelays;
        if (oParams.iGetStateIntervalTimeout !== undefined)
            this.iGetStateIntervalTimeout = oParams.iGetStateIntervalTimeout;
        if (oParams.getStatesCallback !== undefined)
            this.getStatesCallback = oParams.getStatesCallback;

        // default states
        this.currentStates = [false, false, false, false, false, false, false, false];


        self.idStatesInterval = setInterval(function () {
            self.getStates();
        }, self.iGetStateIntervalTimeout);

    };


    /**
     * if this is true, the system waits for getting new states
     *
     * @type {boolean}
     */
    EthRly16.prototype.aStatesDataCallbacks = [];


    /**
     * interpretates the states from serial buffer
     *
     * @param SerBuf
     */
    EthRly16.prototype.getStatesFromData = function (SerBuf) {
        var self = this;



        if ((SerBuf[0] & 0x01) == 0x01)
            this.currentStates[0] = true;
        else
            this.currentStates[0] = false;

        if ((SerBuf[0] & 0x02) == 0x02)
            this.currentStates[1] = true;
        else
            this.currentStates[1] = false;

        if ((SerBuf[0] & 0x04) == 0x04)
            this.currentStates[2] = true;
        else
            this.currentStates[2] = false;

        if ((SerBuf[0] & 0x08) == 0x08)
            this.currentStates[3] = true;
        else
            this.currentStates[3] = false;

        if ((SerBuf[0] & 0x10) == 0x10)
            this.currentStates[4] = true;
        else
            this.currentStates[4] = false;

        if ((SerBuf[0] & 0x20) == 0x20)
            this.currentStates[5] = true;
        else
            this.currentStates[5] = false;

        if ((SerBuf[0] & 0x40) == 0x40)
            this.currentStates[6] = true;
        else
            this.currentStates[6] = false;

        if ((SerBuf[0] & 0x80) == 0x80)
            this.currentStates[7] = true;
        else
            this.currentStates[7] = false;



        if (typeof this.getStatesCallback === "function") {
            this.getStatesCallback(this.getStatesCallbackData);
        }
    };


    /**
     * configure the states callback
     *
     * @param cb
     * @param data
     */
    EthRly16.prototype.setGetStatesCallback = function (cb, data) {
        this.getStatesCallback = cb;
        this.getStatesCallbackData = data;
    }


    /**
     * get the socket-client, if not defined create a new one
     * returned by callback
     *
     * @param cb
     */
    EthRly16.prototype.getClient = function (cb) {
        var self = this;
        if (this.client !== undefined) {
            cb(self.client);
            return;
        }

        this.idStatesInterval = false;

        // NET-CLIENT-Instance

        this.client = new net.Socket({
            readable: true,
            writable: true
        });
        this.client.connect(
            this.port,
            this.host,
            function(){
                self.client.setNoDelay(true);
                self.getStates();

                self.client.on('close', function (had_error) {
                    clearInterval(self.idStatesInterval);
                    self.client = undefined;
                });


                /**
                 * relay sends us some data, try to interpretate
                 */
                self.client.on('error', function (error) {
                    console.error(error);
                });

                /**
                 * relay sends us some data, try to interpretate
                 */
                self.client.on('data', function (data) {
                    self.getStatesFromData(data);
                    self.delayedDisconnect();
                });


                cb(self.client);
            });





    }


    /**
     * connection closes n after last action
     * if read delay is smaller than this, the connection will never closed
     *
     * @type {number}
     */
    EthRly16.prototype.iCloseDelay = 50;



    /**
     * for reducing disconnects while fast swichting, make the disconnect async
     *
     */
    EthRly16.prototype.delayedDisconnect = function(){
        var self = this;
        if( this.disconnectTimeout !== undefined ) {
            clearTimeout(this.disconnectTimeout);
        }
        this.disconnectTimeout = setTimeout(function(){
            if (self.client !== undefined) {
                self.client.destroy();
            }
            self.disconnectTimeout = undefined;
        }, this.iCloseDelay);
    };



    /**
     * get the states from th socket
     */
    EthRly16.prototype.getStates = function () {
        var self = this;
        var iii = new Number();
        iii = 0x5B;
        var bSuccess = this.getClient(function (client) {
            client.write(
                iii.toString(16),
                'hex',
                function () {
                }
            );
        });
    }

    /**
     * does it make sense - it is depending on network speed - hard to handle
     *
     * @param callback
     * @param delay
     */
    EthRly16.prototype.delayedCallback = function(callback, delay) {
        if( typeof callback === "function" ) {
            setTimeout(function () {
                callback();
            }, delay);
        }
    }

    /**
     * write a command to the tcp-socket
     *
     * @param iii
     * @param callback
     */
    EthRly16.prototype.writeCommand = function(iii, callback) {
        var self = this;
        var bSuccess = this.getClient(function (client) {
            client.write(
                iii.toString(16),
                'hex',
                function () {
                    self.delayedDisconnect();
                    if( typeof callback === "function" ) {
                        callback();
                    }
                }
            );
        });
    }

    /**
     * Switch all relays off
     *
     * @returns boolean
     */
    EthRly16.prototype.allOff = function (callback) {
        var iii = new Number();
        iii = 0x6E;
        this.writeCommand(iii, function(){
            self.currentStates = [false, false, false, false, false, false, false, false];
            if( typeof callback === "function" ) {
                callback();
            }
        });
    };


    /**
     * Switch all relays on
     *
     * @returns boolean
     */
    EthRly16.prototype.allOn = function (callback) {
        var self = this;
        var iii = new Number();
        iii = 0x64;
        this.writeCommand(iii, function(){
            self.currentStates = [true, true, true, true, true, true, true, true];
            if( typeof callback === "function" ) {
                callback();
            }

        });
    };


    /**
     * Switch a single relay off
     *
     * @param iRelaisNo
     */
    EthRly16.prototype.relaisOff = function (iRelaisNo, callback) {
        var self = this;
        var iii = new Number();
        iii = 111;
        iii += iRelaisNo;
        this.writeCommand(iii, function(){
            self.currentStates[iRelaisNo] = false;
            if( typeof callback === "function" ) {
                callback();
            }
        });
    };


    /**
     * Switch a single relay on
     *
     * @param iRelaisNo
     * @returns boolean
     */
    EthRly16.prototype.relaisOn = function (iRelaisNo, callback) {
        var self = this;
        var iii = new Number();
        iii = 101;
        iii += iRelaisNo;
        this.writeCommand(iii, function(){
            self.currentStates[iRelaisNo] = true;
            if( typeof callback === "function" ) {
                callback();
            }
        });
    };


    /**
     * Switch multiple relais
     *
     * @param aStates
     */
    EthRly16.prototype.switchStates = function (aStates) {
        var self = this;
        for (var i = 0; i < aStates.length; i++) {
            if (aStates[i]) {
                this.relaisOn(i)
            }
            else {
                this.relaisOff(i)
            }
        }
    };


    /**
     * return if a relay is on
     *
     * @param iRelay
     * @returns boolean
     */
    EthRly16.prototype.isRelayOn = function (iRelay) {
        return this.currentStates[iRelay];
    };


})();


/**
 * npm module export
 */
module.exports = EthRly16;
