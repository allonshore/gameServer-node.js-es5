var tcppkg = {
	// 根据封包协议我们读取包体的长度;
	read_pkg_size: function(pkg_data, offset) {
		if (offset > pkg_data.length - 2) { // 没有办法获取长度信息的;
			return -1; 
		}

		var len = pkg_data.readUInt16LE(offset);
		return len;
	},

	// 把一个要发送的数据,封包 2个字节的长度 + 数据
	// data string 二进制的buffer
	package_data: function(data) {
		var buf = Buffer.allocUnsafe(2 + data.length);//2是2个字节的长度
		buf.writeInt16LE(2 + data.length, 0);//前面2个字节写入包体长度 = 长度字节的长度 + 数据长度
	    buf.fill(data, 2);

		return buf;
	}

};

module.exports = tcppkg;