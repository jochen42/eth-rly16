/**
 * nodejs module for controlling ETH-RLY16 card of Devantech Ltd
 *
 * @date: 03.05.2013
 * @author: mail@jochen-weber.net
 */



/**
 * Modul requirements
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
    EthRly16 = function(oParams) {
        var self = this;

        // default Connection-Parameters
        this.host = "127.0.0.1";
        this.port = 17494;
        this.countRelays = 8;
        this.iGetStateIntervalTimeout = 5000;

        // werte aus uebergebener config
        if( oParams.host !== undefined )
            this.host = oParams.host;
        if( oParams.port !== undefined )
            this.port = oParams.port;
        if( oParams.countRelays !== undefined )
            this.countRelays = oParams.countRelays;
        if( oParams.iGetStateIntervalTimeout !== undefined )
            this.iGetStateIntervalTimeout = oParams.iGetStateIntervalTimeout;


        // default states
        this.bConnected = false;
        this.currentStates = [false, false, false, false, false, false, false, false];

        // NET-CLIENT-Instancee
        this.client = net.createConnection({host: this.host, port: this.port});

        this.idStatesInterval = false;

        /**
         * the connection is estabilished, read the states and create an intervall
         */
        this.client.on('connect', function() {
            self.getStates();
            self.bConnected = true;
            self.idStatesInterval = setInterval(function(){
                self.getStates();
            }, self.iGetStateIntervalTimeout);
        });


        /**
         * relay sends us some data, try to interpretate
         */
        this.client.on('data', function(data) {
            self.getStatesFromData(data);
        });

        /**
         * connection closed
         */
        this.client.on('end', function() {
            self.bConnected = false;
            clearInterval(self.idStatesInterval);
        });


    };


    /**
     * if this is true, the system waits for getting new states
     *
     * @type {boolean}
     */
    EthRly16.prototype.aStatesDataCallbacks = [];



    /**
     * interpretas the states from serial buffer
     *
     * @param SerBuf
     */
    EthRly16.prototype.getStatesFromData = function(SerBuf){
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


        // run registered callbacks
        this.aStatesDataCallbacks.forEach(function(val, i){
            self.aStatesDataCallbacks[i]();
            self.aStatesDataCallbacks.splice(i, i+1);
        });
    };


    /**
     * close tcp connection
     */
    EthRly16.prototype.disconnect = function() {
        this.client.emit("close");
    };



    /**
     * get the states from th socket
     */
    EthRly16.prototype.getStates = function() {
        var self = this;
        var iii = new Number();
        iii = 0x5B;
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex',
            function(){
            }
        );
    }


    /**
     *
     * @param callback
     */
    EthRly16.prototype.waitForStatesCallBackInit = function(callback) {
        var self = this;
        if( callback !== undefined ) {
            self.getStates();
            this.aStatesDataCallbacks.push(callback);
        }
    }



    /**
     * Switch all relays off
     *
     * @returns boolean
     */
    EthRly16.prototype.allOff = function(callback) {
        var self = this;
        var iii = new Number();
        iii = 0x6E;
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex',
            function(){
                self.waitForStatesCallBackInit(callback);
            }
        );
        return bSuccess;
    };



    /**
     * Switch all relays on
     *
     * @returns boolean
     */
    EthRly16.prototype.allOn = function(callback) {
        var self = this;
        var iii = new Number();
        iii = 0x64;
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex',
            function(){
                self.waitForStatesCallBackInit(callback);
            }
        );
        return bSuccess;
    };



    /**
     * Switch a single relay off
     *
     * @param iRelaisNo
     */
    EthRly16.prototype.relaisOff = function(iRelaisNo, callback) {
        var self = this;
        var iii = new Number();
        iii = 111;
        iii += iRelaisNo;
        //console.log(iii);
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex',
            function(){
                self.waitForStatesCallBackInit(callback);
            }
        );
    };


    /**
     * Switch a single relay on
     *
     * @param iRelaisNo
     * @returns boolean
     */
    EthRly16.prototype.relaisOn = function(iRelaisNo, callback) {
        var self = this;
        var iii = new Number();
        iii = 101;
        iii += iRelaisNo;
        //console.log(iii);
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex',
            function(){
                self.waitForStatesCallBackInit(callback);
            }
        );
        return bSuccess;
    };


    /**
     * Switch multiple relais
     *
     * @param aStates
     */
    EthRly16.prototype.switchStates = function(aStates) {
        var self = this;
        for( var i=0 ; i<aStates.length ; i++ ) {
            if( aStates[i] )
                this.relaisOn(i)
            else
                this.relaisOff(i)
        }
    };


    /**
     * return if a relay is on
     *
     * @param iRelay
     * @returns boolean
     */
    EthRly16.prototype.isRelayOn = function(iRelay) {
        return this.currentStates[iRelay];
    };



})();




/**
 * node js export
 */
module.exports = EthRly16;
