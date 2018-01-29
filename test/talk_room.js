let log = require("../utils/log.js")
let service = {
    stype: 1, //服务号
    name: "talk room", //服务的名称
    //初始服务初始化的时候调用
    init: function() {
        log.info(this.name, "service init")
    },
    //每个服务收到数据的时候调用
    on_recv_player_cmd: function(session, ctype, body) {
        log.info(this.name, "on_recv_player_cmd init")
    },
    //每个服务链接丢失后调用 被动离开
    on_player_disconnect: function(session) {
        log.info(this.name + "on_player_disconnect", session.session_key)
    }
}

module.exports = service