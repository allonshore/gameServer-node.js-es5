//原型扩展模块

//字符串长度  你好 utf8格式的，不代表字节数，buf协议，写入我们的字符串长度
String.prototype.utf8_byte_len = function() {
    let totalLength = 0;
    let i;
    let charCode;
    for (i = 0; i < this.length; i++) {
        charCode = this.charCodeAt(i)
        if (charCode < 0x007f) {
            totalLength = totalLength + 1;
        } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
            totalLength += 2
        } else if ((0x0080 <= charCode) && (charCode <= 0xffff)) {
            totalLength += 3
        }
    }
    return totalLength
}