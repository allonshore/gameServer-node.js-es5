let log = require("../utils/log.js")
let proto_man = require("./proto_man")
    //服务中心
let service_modules = {

    }
    //注册服务
function register_service(stype, service) {
    if (service_modules[stype]) {
        log.warn(service_modules[stype].name, "service is registered!!!!!!!")
    }

    service_modules[stype] = service
        //服务注册成功 调用初始化 
    service.init()
}


function on_recv_client_cmd(session, str_or_buf) {
    //更具我们收到的数据解码我们的命令
    let cmd = proto_man.decode_cmd(session.proto_type, str_or_buf)
        // 无效的回false 无效链接 一定关闭
    if (!cmd) {
        return false
    }

    let stype, ctype, body
    stype = cmd[0];
    ctype = cmd[1];
    body = cmd[2];

    log.info(stype, ctype, body)
        //判断服务是否存在
    if (service_modules[stype]) {
        //分发服务处理模块
        service_modules[stype].on_recv_player_cmd(session, ctype, body)
    }
    return true
        //end
}

//客户端离开,断线
function on_client_lost_connect(session) {
    log.info("session lost:", session.session_key)
        //遍历所有的服务模块通知在这个服务上的玩家掉线了
    for (let key in service_modules) {

        //玩家掉线了
        service_modules[key].on_player_disconnect(session)

    }
}
//服务管理中心
let service_manager = {
    on_client_lost_connect: on_client_lost_connect, //客户断线链接处理器
    on_recv_client_cmd: on_recv_client_cmd, //接收客户端命令字
    register_service: register_service //服务注册器
}

module.exports = service_manager