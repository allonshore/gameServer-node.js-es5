var ws = require("ws");
let tcppkg = require("../netbus/tcppkg");
let proto_man = require("../netbus/proto_man")
    // url ws://127.0.0.1:6080
    // 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
let data = {
    uname: "blake",
    upwd: "123456"
}

function encode_cmd_1_1(body) {
    let stype = 1;
    let ctype = 1;
    let total_len = 2 + 2 + body.uname.length + body.upwd.length + 2 + 2;
    let buffer = Buffer.allocUnsafe(total_len)
    buffer.writeUInt16LE(stype, 0)
    buffer.writeUInt16LE(ctype, 2)
        //uname 字符串
    buffer.writeUInt16LE(body.uname.length, 4)
    buffer.write(body.uname, 6)
        //upwd 字符串
    let offset = 6 + body.uname.length
    buffer.writeUInt16LE(body.upwd.length, offset)
        // log.error(body.upwd)
        // log.error(offset + 2)
    buffer.write(body.upwd, offset + 2)
        // log.error(buffer)
    return buffer

}

proto_man.reg_encoder(1, 1, encode_cmd_1_1)
var sock = new ws("ws://127.0.0.1:6083");
sock.on("open", function() {
    let cmd_buf = proto_man.encode_cmd(proto_man.PROTO_BUF, 1, 1, data)
    console.log(cmd_buf)
    sock.send(cmd_buf);
});

sock.on("error", function(err) {
    console.log("error: ", err);
});

sock.on("close", function() {
    console.log("close");
});

sock.on("message", function(data) {
    console.log(data);
});