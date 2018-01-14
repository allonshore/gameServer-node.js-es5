var net = require("net");
var netpkg = require("./netpkg");

var last_pkg = null;

var server = net.createServer(function(client_sock) { 
	console.log("client comming", client_sock.remoteAddress, client_sock.remotePort);

	client_sock.on("close", function() {
		console.log("close socket");
	});

	client_sock.on("data", function(data) {
		console.log(data);
		if (last_pkg != null) { // 上一次剩余没有处理完的半包;
			var buf = Buffer.concat([last_pkg, data], last_pkg.length + data.length);
			last_pkg = buf;
		}
		else {
			last_pkg = data;	
		}

		var offset = 0;
		var pkg_len = netpkg.read_pkg_size(last_pkg, offset);
		if (pkg_len < 0) {
			return;
		}

		while(offset + pkg_len <= last_pkg.length) { // 判断是否有完整的包;
			// 根据长度信息来读取我们的数据,架设我们穿过来的是文本数据
			var cmd_buf = Buffer.allocUnsafe(pkg_len - 2); // 2个长度信息
			last_pkg.copy(cmd_buf, 0, offset + 2, offset + pkg_len);

			console.log("recv Cmd: ", cmd_buf); // cmdbuf ,用户发过来的命令的数据;
			console.log(cmd_buf.toString("utf8"));

			offset += pkg_len;
			if (offset >= last_pkg.length) { // 正好我们的包处理完了;
				break;
			}

			pkg_len = netpkg.read_pkg_size(last_pkg, offset);
			if (pkg_len < 0) {
				break;
			}
		}

		// 能处理的数据包已经处理完成了,保存 0.几个包的数据
		if (offset >= last_pkg.length) {
			last_pkg = null;
		}
		else { // offset, length这段数据拷贝到新的Buffer里面
			var buf = Buffer.allocUnsafe(last_pkg.length - offset);
			last_pkg.copy(buf, 0, offset, last_pkg.length);
			last_pkg = buf;
		}
		// end 
	});


	client_sock.on("error", function(err) {
		console.log("error", err);
	});
});


server.on("listening", function() {
	console.log("start listening...");
});



server.on("error", function() {
	console.log("listen error");
});

server.on("close", function() {
	console.log("server stop listener");
});

server.listen({
	port: 6080,
	host: "127.0.0.1",
	exclusive: true,
});




