require("../init.js")
let netbus = require("../netbus/netbus.js")
let proto_man = require("../netbus/proto_man.js")

let service_manager = require("../netbus/service_manager.js")
let talk_room = require("./talk_room.js")
netbus.start_tcp_server("127.0.0.1", 6080, proto_man.PROTO_JSON)
netbus.start_tcp_server("127.0.0.1", 6081, proto_man.PROTO_BUF)


netbus.start_ws_server("127.0.0.1", 6082, proto_man.PROTO_JSON)
netbus.start_ws_server("127.0.0.1", 6083, proto_man.PROTO_BUF)


service_manager.register_service(1, talk_room)