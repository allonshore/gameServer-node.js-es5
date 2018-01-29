let net = require('net')
    // 加载node上websocket模块 ws;
let ws = require("ws");
let log = require('../utils/log.js')
let tcppkg = require('./tcppkg.js')
let proto_man = require('./proto_man')
let service_manager = require('./service_manager')
    //网络中心类
let netbus = {
        start_tcp_server: start_tcp_server,
        start_ws_server: start_ws_server,
        session_send: session_send,
        session_close: session_close
    }
    //全局管理session表
let global_session_list = {};
//session唯一标识
let global_session_key = 1;

//有客户端的session接入进来
function on_session_enter(session, proto_type, is_ws) {
    if (is_ws) {
        //ws
        log.info("session ws enter", session._socket.remoteAddress, session._socket.remotePort)
    } else {
        //tcp
        log.info("session tcp enter", session.remoteAddress, session.remotePort);
    }
    session.last_pkg = null; //表示我们存储的上一次没处理完的tcp包
    session.is_ws = is_ws //判断接进来的类型是tcp还是ws
        // log.info(proto_types)
    session.proto_type = proto_type

    //加入到我们的session全局管理表里面
    global_session_list[global_session_key] = session
        //session唯一标识
    session.session_key = global_session_key;
    global_session_key++;
    //end
}
//客户端离开,断线
function on_session_exit(session) {
    log.info("session exit!!!!")
    service_manager.on_client_lost_connect(session)
    session.last_pkg = null; //离开的时候包清空
    if (global_session_list[session.session_key]) {
        global_session_list[session.session_key] = null; //从全局管理列表里面删除
        //为什么用对象存不用数组 对象可以删除键值 不会无限变大
        delete global_session_list[session.session_key]; //把这个key，value从list里面删除
    }
}
//一定能够保证是一个整包
//如果是json协议 str_or_buf一定是字符串
//如果是buf协议 str_or_buf一定是buf二进制
function on_session_rece_cmd(session, json_or_buf) {
    if (!service_manager.on_recv_client_cmd(session, json_or_buf)) {
        //请求无效 就关闭这个链接
        session_close(session)
    }
    log.info(json_or_buf)
}
//发送数据包
function session_send(session, cmd) {
    if (!session.is_ws) {
        //tcp
        let data = tcppkg.package_data(cmd);
        session.write(data)
        return;
    } else {
        //ws
        session.send(cmd)
    }
}
//关闭一个session
function session_close(session) {
    if (!session.is_ws) {
        session.end()
        return
    } else {
        session.close()
    }
}

function add_client_session_listener(session, proto_type) {
    //客户端进来了 
    on_session_enter(session, proto_type, false)

    //客户端断开连接的时候    
    session.on("close", function() {
        on_session_exit(session);
    });



    //客户端有数据的时候  最开始读数据的地方 
    session.on("data", function(data) {
        //
        if (!Buffer.isBuffer(data)) { //不合法的数据 主动关闭seesion
            session_close(session)
            return //关掉
        }
        //
        let last_pkg = session.last_pkg //接收的包挂载到session里面
            // console.log(data);
        if (last_pkg != null) { // 上一次剩余没有处理完的半包;
            var buf = Buffer.concat([last_pkg, data], last_pkg.length + data.length);
            last_pkg = buf;
        } else {
            last_pkg = data;
        }

        var offset = 0;
        var pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
        if (pkg_len < 0) {
            return;
        }

        while (offset + pkg_len <= last_pkg.length) { // 判断是否有完整的包;
            // 根据长度信息来读取我们的数据,架设我们穿过来的是文本数据
            let cmd_buf;

            // console.log("recv Cmd: ", cmd_buf); // cmdbuf ,用户发过来的命令的数据;
            // console.log(cmd_buf.toString("utf8"));
            //收到一个完整的数据包

            if (session.proto_type == proto_man.PROTO_JSON) {
                //json
                let json_str = last_pkg.toString("utf8", offset + 2, offset + pkg_len)
                console.log("session json_st", json_str)
                if (!json_str) {
                    session_close(session)
                    return
                }
                console.log("session json_st", json_str)
                on_session_rece_cmd(session, json_str)
            } else {
                //buf
                cmd_buf = Buffer.allocUnsafe(pkg_len - 2); // 2个长度信息
                last_pkg.copy(cmd_buf, 0, offset + 2, offset + pkg_len);
                on_session_rece_cmd(session, cmd_buf)
            }

            offset += pkg_len;
            if (offset >= last_pkg.length) { // 正好我们的包处理完了;
                break;
            }

            pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
            if (pkg_len < 0) {
                break;
            }
        }

        // 能处理的数据包已经处理完成了,保存 0.几个包的数据
        if (offset >= last_pkg.length) {
            last_pkg = null;
        } else { // offset, length这段数据拷贝到新的Buffer里面
            let buf = Buffer.allocUnsafe(last_pkg.length - offset);
            last_pkg.copy(buf, 0, offset, last_pkg.length);
            last_pkg = buf;
        }

        session.last_pkg = last_pkg //从新把为处理完的包指向session 供下一次使用
            // end            
    });

    //可以不用处理，最终都会调用close
    session.on("error", function(err) {
        console.log("error", err);
    });
}

function start_tcp_server(ip, port, proto_type) {
    let str_proto = {
        1: "PROTO_JSON",
        2: "PROTO_BUF"
    }
    log.info("start tcp server", ip, port, str_proto[proto_type])

    let server = net.createServer(function(client_sock) {
        add_client_session_listener(client_sock, proto_type)
    });
    //监听服务发生错误的时候
    server.on("error", function() {
        log.error("listen error");
    });
    //监听服务关闭的时候
    server.on("close", function() {
        log.error("server stop listener");
    });

    server.listen({
        port: port,
        host: ip,
        exclusive: true,
    });


}
//--------------------------------------
// 监听接入进来的客户端事件

function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]"
}

function ws_add_client_session_event(session, proto_type_z) {
    // close事件
    session.on("close", function() {
        console.log("client close");
        on_session_exit(session)
    });

    // error事件
    session.on("error", function(err) {
        console.log("client error", err);
    });
    // end 

    // message 事件, data已经是根据websocket协议解码开来的原始数据；
    session.on("message", function(data) {
        console.log("session", session.proto_type)
        if (session.proto_type == proto_man.PROTO_JSON) {
            if (!isString(data)) {
                log.info(isString(data))
                session_close(session)
                return false
            }

            on_session_rece_cmd(session, data)
        } else {
            if (!Buffer.isBuffer(data)) {
                session_close(session)
                return false
            }
            on_session_rece_cmd(session, data)
        }

        // client_sock.send("Thank you!");
    });
    console.log("on_session_enter", proto_type_z)
    on_session_enter(session, proto_type_z, true)
        // end 
}

function start_ws_server(ip, port, proto_type_c) {
    let str_proto = {
        1: "PROTO_JSON",
        2: "PROTO_BUF"
    }
    log.info("start ws server", ip, port, str_proto[proto_type_c])
    let server = new ws.Server({
            host: ip,
            port: port
        })
        // connection 事件, 有客户端接入进来;
    function on_server_client_comming(client_sock) {
        console.log("client comming", proto_type_c);
        ws_add_client_session_event(client_sock, proto_type_c);
    }

    server.on("connection", on_server_client_comming);

    // error事件,表示的我们监听错误;
    function on_server_listen_error(err) {
        log.error("ws is error", err)
    }
    server.on("error", on_server_listen_error);

    // close事件,表示的我们监听错误;
    function on_server_listen_close(err) {
        log.error("ws is close", err)
    }
    server.on("close", on_server_listen_close);

    // headers事件, 回给客户端的字符。
    function on_server_headers(data) {
        // console.log(data);
    }
    server.on("headers", on_server_headers);
}
netbus.start_tcp_server = start_tcp_server
netbus.start_ws_server = start_ws_server

netbus.session_send = session_send
netbus.session_close = session_close

module.exports = netbus