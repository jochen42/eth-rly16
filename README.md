# eth-rly16
nodejs module for controlling ETH-RLY16 card of Devantech Ltd


Example
=======

```javascript
var oCard = new Relaycard(this, {'host': '192.168.0.11', 'countRelays': 8}),


oCard.allOn(); // switch all in
oCard.isRelayOn(1)  // return boolean value if, the relay 1 is on
```