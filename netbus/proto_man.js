let netbus = require("./netbus.js")
//服务号和命令号不能为零 data部分不能为空
let proto_man = {};
//编码函数
function _json_encode(stype,ctype,body){
    let cmd = {}
       cmd[0] = stype;
       cmd[1] = ctype;
       cmd[2] = body;
    return JSON.stringify(cmd)  
}
//解码函数
function json_decode(cmd_json){
    let cmd=JSON.parse(cmd_json)
    if(!cmd || !cmd[0] || !cmd[1] ){ //cmd解码错误 cmd[0]不存在 cmd[1]不存在
           return null
    }
    return cmd
}
//proto_type 协议号 json,buf
//stype      服务号 
//cmd_type   命令号 
//body       数据
//编码函数
function encode_cmd(proto_type,stype,cmd_type,body){
    if(proto_type == netbus.PROTO_JSON){
        return _json_encode(stype,ctype,body)
    }

    //buf协议
    //end
    return null;
}
//proto_type 协议类型
//str_or_buf 接收到的数据命令
// 返回 {0：是type，1，ctype,2:body}
//解码函数
function decode_cmd(proto_type,str_or_buf){
    let cmd = null;
    if(proto_type == netbus.PROTO_JSON){

    }
    return cmd;
}
proto_man.encode_cmd = encode_cmd
proto_man.decode_cmd = encode_cmd

module.exports = proto_man