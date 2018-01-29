let log = require('../utils/log.js')
let netbus = require("../netbus/netbus.js")
let proto_man = require("../netbus/proto_man.js")



//json 编码和解码
let data = {
        uname: "blake",
        upwd: "123456"
    }
    // let buf = proto_man.encode_cmd(netbus.PROTO_JSON, 1, 1, data)
    //     // log.info(buf)
    //     // log.error("json length", buf.length)

// let cmd = proto_man.decode_cmd(netbus.PROTO_JSON, buf)
// log.info(cmd)
//end

//buf 编码和解码
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

function decode_cmd_1_1(cmd_buf) {
    let stype = 1
    let ctype = 1
        //uname

    let uname_len = cmd_buf.readUInt16LE(4)

    //服务号加命令号加uname的长度+2比cmd_buf.length大就是有问题
    if ((uname_len + 2 + 2 + 2) > cmd_buf.length) {
        return null
    }

    let uname = cmd_buf.toString("utf8", 6, 6 + uname_len)
    log.info(uname)
    if (!uname) {
        return null
    }

    let offset = 6 + uname_len

    let upwd_len = cmd_buf.readUInt16LE(offset)

    if ((offset + upwd_len + 2) > cmd_buf.length) {
        log.error(3)
        return null
    }

    let upwd = cmd_buf.toString("utf8", offset + 2, offset + 2 + upwd_len)
        // let upwd = cmd_buf.toString("utf8", 13, 19)
    let cmd = {
        0: 1,
        1: 1,
        2: {
            "uname": uname,
            "upwd": upwd
        }
    }

    return cmd
}

proto_man.reg_encoder(1, 1, encode_cmd_1_1)
proto_man.reg_decoder(1, 1, decode_cmd_1_1)
    //end

let proto_cmd_buf = proto_man.encode_cmd(netbus.PROTO_BUF, 1, 1, data)
log.info(proto_cmd_buf)
log.error(proto_cmd_buf.length)
let cmd = proto_man.decode_cmd(netbus.PROTO_BUF, proto_cmd_buf)
log.info(cmd)
    // log.error(cmd.length)