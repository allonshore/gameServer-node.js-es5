let service = {
    stype: 1, //服务号
    name: "service tempalte", //服务的名称
    //初始服务初始化的时候调用
    init: function() {

    },
    //每个服务收到数据的时候调用
    on_recv_player_cmd: function(session, ctype, body) {

    },
    //每个服务链接丢失后调用 被动离开
    on_player_disconnect: function(session) {

    }
}

module.exports = service