let netbus = require("../netbus/netbus.js")

netbus.start_tcp_server("127.0.0.1",6083,netbus.PROTO_JSON)

netbus.start_ws_server("127.0.0.1",6082,netbus.PROTO_JSON)