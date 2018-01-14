let express = require("express")
let path =require("path")


if(process.argv.length < 3){
    console.log("node webserver.js port")
    return;
}


let app =express();
let port = parseInt(process.argv[2]);
process.chdir("./apps/web_server");
console.log(process.cwd())
app.use(express.static(path.join(process.cwd(),"www_root")))

app.listen(port);

console.log("webserver started at port"+ port)


