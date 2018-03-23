let net = require("net");
let tcppkg = require("../netbus/tcppkg");
let proto_man = require("../netbus/proto_man")
var sock = net.connect({
    port: 6080,
    host: "127.0.0.1",
}, function() {
    console.log('connected to server!');
});

sock.on("connect", function() {
    console.log("connect success");

    // sock.write(netpkg.package_data("Hello!"));
    // sock.write(netpkg.test_pkg_two_action("start", "stop"));
    //1,2body = "Hello Talk room!!"
    let cmd_buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 2, 2, "Hello Talk room!!")
    cmd_buf = tcppkg.package_data(cmd_buf)
    sock.write(cmd_buf)

});



sock.on("error", function(e) {
    console.log("error", e);
});


sock.on("close", function() {
    console.log("close");
});


sock.on("end", function() {
    console.log("end event");
});

sock.on("data", function(data) {
    console.log(data);
});