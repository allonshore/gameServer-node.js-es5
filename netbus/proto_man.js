let netbus = require("./netbus.js")
let log = require('../utils/log.js')
    //协议管理

/*规定
1，服务号和命令号不能为零 data部分不能为空
2，服务号和命令号大小不能超过2个字节的整数
3，buf协议里面2个字节来存放服务号，命令号;0开始的服务号，1开始的命令号
4，加密解密
5, 服务号和命令号都用小尾
*/
let proto_man = {
    PROTO_JSON: 1, //协议类型 json
    PROTO_BUF: 2, //协议类型  buf
    encode_cmd: encode_cmd, //编码器
    decode_cmd: decode_cmd, //解码器
    reg_decoder: reg_buf_decoder, //解码器注册函数
    reg_encoder: reg_buf_encoder, //编码器注册函数
    decrypt_cmd: decrypt_cmd,
    encrypt_cmd: encrypt_cmd
};

//buf协议的编码/解码管理   stype,ctype -->encoder/decoder
//解码器  buf协议的所有解码函数
//解码中心
let decoders = {

    }
    //编码器  buf协议的所有编码函数
    //编码中心
let encoders = {

    }
    //加密函数
function encrypt_cmd(str_or_buf) {
    return str_or_buf
}
//解密函数
function decrypt_cmd(str_or_buf) {
    return str_or_buf
}

//编码函数
function _json_encode(stype, ctype, body) {
    let cmd = {}
    cmd[0] = stype;
    cmd[1] = ctype;
    cmd[2] = body;
    let str = JSON.stringify(cmd)
        //此处可以做加密  
    return str
}
//解码函数
function json_decode(cmd_json) {
    let cmd = null
        //避免报错直接挂掉服务器
    try {
        cmd = JSON.parse(cmd_json)
    } catch (e) {

    }

    console.log(cmd)
    if (!cmd || !cmd[0] ||
        !cmd[1] ||
        typeof(cmd[0]) == 'underfined' ||
        typeof(cmd[1]) == 'underfined' ||
        typeof(cmd[2]) == 'underfined') { //cmd解码错误 cmd[0]不存在 cmd[1]不存在
        return null
    }
    return cmd
}
//proto_type 协议号 json,buf
//stype      服务号 
//cmd_type   命令号 
//body       数据
//编码函数
//返回后是一段编码过的数据
function encode_cmd(proto_type, stype, cmd_type, body) {
    let buf = null;
    if (proto_type == proto_man.PROTO_JSON) {
        buf = _json_encode(stype, cmd_type, body)
            // return encrypt_cmd_buf(str)
    } else {
        //buf协议
        log.info(proto_type, stype, cmd_type, body)
        let key = get_key(stype, cmd_type)
        log.info(key)
        if (!encoders[key]) {
            console.log(1)
            return null
        }
        buf = encoders[key](stype, ctype, body)
    }
    //空不加密
    // if (buf) {
    //     buf = encrypt_cmd_buf(buf)
    // }
    //end
    log.info(buf)
    return buf;
}
//proto_type 协议类型
//str_or_buf 接收到的数据命令
// 返回 {0：是type，1，ctype,2:body}
//解码函数
//返回的是一段解码好的数据
function decode_cmd(proto_type, str_or_buf) {
    let str_or_bufs = str_or_buf

    if (proto_type == proto_man.PROTO_JSON) {
        log.info(str_or_bufs)
        return json_decode(str_or_bufs)
    }
    //验证合法性
    if (str_or_buf.length < 4) {
        return null
    }
    let cmd = null;
    let stype = str_or_bufs.readUInt16LE(0)
    let ctype = str_or_bufs.readUInt16LE(2)
        // log.error(stype, ctype)
    let key = get_key(stype, ctype)
        // log.error(key)
    if (!decoders[key]) {
        log.error(2)
        return null; //无解码函数
    }
    // log.error(decoders[key])
    let buf = decoders[key](str_or_buf)
    log.error(buf)
    cmd = encrypt_cmd_buf(buf)
    return cmd;
}


//产生key的函数  自定义公式的 也可以用随机字符串
function get_key(stype, ctype) {
    return (stype * 65536 + ctype)
}
//编码器函数注册 encode_func(body) return 二进制buffer对象
function reg_buf_encoder(stype, ctype, encode_func) {
    let key = get_key(stype, ctype)
    if (encoders[key]) { //已经注册过了，是否错了
        log.warn("stype" + stype + ',' + ctype + "is reged!")
    }
    encoders[key] = encode_func
}
//解码器函数注册 decode_func(cmd_buf) return cmd{0:服务号，1：命令号，2:body}
function reg_buf_decoder(stype, ctype, decode_func) {
    let key = get_key(stype, ctype)
    if (decoders[key]) { //已经注册过了，是否错了
        log.warn("stype" + stype + ',' + ctype + "is reged!")
    }
    decoders[key] = decode_func
}

module.exports = proto_man