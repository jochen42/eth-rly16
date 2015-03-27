# eth-rly16
 npm module for controlling ETH-RLY16 card of Devantech Ltd.

## Example

```javascript
var EthRly16 = require('eth-rly16');

// create instance
var oCard = new EthRly16({'host': '192.168.97.67', 'countRelays': 8});


// relay index (0-7)
var i = 5;

// switch all in
oCard.relaisOn(i, function () {

    // SHOULD log true
    console.log("State if Relais " + i + ": " + oCard.isRelayOn(i));

    // switch relais i off
    oCard.relaisOff(i, function () {

        // SHOULD log false
        console.log("State if Relais " + i + ": " + oCard.isRelayOn(i));

    });

});
```

## Configuration parameters
* host: IP or Hostname of the Device
* port: TCP-Port of the Device (optional)
* countRelays: the count of the used relays (optional, default 8)
* iGetStateIntervalTimeout: reread-timeout in milliseconds (optional, default: 5000)

## Version History
* 0.2.4 bug fixing - (making it work :))
* 0.2.3 Initial release
