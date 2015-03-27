# eth-rly16
 npm module for controlling ETH-RLY16 card of Devantech Ltd.

## Example

```javascript
// create instance
var oCard = new ETHRLY16({'host': '192.168.0.11', 'countRelays': 8});

// switch all in
oCard.allOn();

// return boolean value if, the relay 1 is on
oCard.isRelayOn(1)
```

## Configuration parameters
* host: IP or Hostname of the Device
* port: TCP-Port of the Device (if not default)
* countRelays: the count of the used relays (starting on zero)
* iGetStateIntervalTimeout: reread-timeout in milliseconds

## Version History
* 0.2.3 Initial release
