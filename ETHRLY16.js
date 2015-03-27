/**
 * nodejs module for controlling ETH-RLY16 card of Devantech Ltd
 *
 * @date: 03.05.2013
 * @author: jochen.weber@jochen-weber.net
 */




/**
 * Modul requirements
 */
var net = require('net');



var ETHRLY16 = null;



(function () {

    "use strict";


    /**
     * constructor
     *
     * @param oParams
     * @constructor
     */
    ETHRLY16 = function(oParams) {
        var self = this;

        // default Connection-Parameters
        this.host = "127.0.0.1";
        this.port = 17494;
        this.countRelays = 8;
        this.iGetStateIntervalTimeout = 100;

        // werte aus uebergebener config
        if( typeof(oParams.host) !== undefined )
            this.host = oParams.host;
        if( typeof(oParams.port) !== undefined )
            this.port = oParams.port;
        if( typeof(oParams.countRelays) !== undefined )
            this.countRelays = oParams.countRelays;
        if( typeof(oParams.iGetStateIntervalTimeout) !== undefined )
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
            //console.log("connected to: " + self.host);
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
            //console.log('disconnected from ' + self.host);
            clearInterval(self.idStatesInterval);
        });


    };




    /**
     * interpretas the states from serial buffer
     *
     * @param SerBuf
     */
    ETHRLY16.prototype.getStatesFromData = function(SerBuf){
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
    };


    /**
     * close tcp connection
     */
    ETHRLY16.prototype.disconnect = function() {
        this.client.emit("close");
    };



    /**
     * get the states from th socket
     */
    ETHRLY16.prototype.getStates = function() {
        //console.log("getStates on " + this.host);
        var iii = new Number();
        iii = 0x5B;
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex',
            function() {
            }
        );
    }



    /**
     * Switch all relays off
     *
     * @returns boolean
     */
    ETHRLY16.prototype.allOff = function() {
        var iii = new Number();
        iii = 0x6E;
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex'
        );
        return bSuccess;
    };



    /**
     * Switch all relays on
     *
     * @returns boolean
     */
    ETHRLY16.prototype.allOn = function() {
        var iii = new Number();
        iii = 0x64;
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex'
        );
        return bSuccess;
    };



    /**
     * Switch a single relay off
     *
     * @param iRelaisNo
     * @returns boolean
     */
    ETHRLY16.prototype.relaisOff = function(iRelaisNo) {
        var iii = new Number();
        iii = 111;
        iii += iRelaisNo;
        //console.log(iii);
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex'
        );
        return bSuccess;
    };


    /**
     * Switch a single relay on
     *
     * @param iRelaisNo
     * @returns boolean
     */
    ETHRLY16.prototype.relaisOn = function(iRelaisNo) {
        var iii = new Number();
        iii = 101;
        iii += iRelaisNo;
        //console.log(iii);
        var bSuccess = this.client.write(
            iii.toString(16),
            'hex'
        );
        return bSuccess;
    };


    /**
     * Switch multiple cards
     *
     * @param aStates
     */
    ETHRLY16.prototype.switchStates = function(aStates) {
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
    ETHRLY16.prototype.isRelayOn = function(iRelay) {
        return this.currentStates[iRelay];
    };



})();




/**
 * node js export
 */
module.exports = ETHRLY16;
