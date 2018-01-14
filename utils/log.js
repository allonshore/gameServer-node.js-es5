let util =require('util')

//log 等级
const LEVEL ={
    ALL:Infinity,
    INFO:3,
    WARN:2,
    ERROR:1,
    NONE:-Infinity
};

//log 颜色
const COLOR = {
    RESET:'\u001b[0m',
    INFO:'\u001b[32m',  //green
    WARN:'\u001b[33m',  //yelloe
    ERROR:'\u001b[31m'  //red
}

//全局日志等级
let globalLevel = LEVEL.ALL

//日志输入石佛带颜色
let coloredOutput = true

//设置日志等级
function setLevel(level){
    globalLevel = level
}

//设置输出颜色
function setColoredOutput(bool){
    coloredOutput = bool
}

function info(){
    if(LEVEL.INFO <= globalLevel){
        log(LEVEL.INFO,util.format.apply(this,arguments))
    }
}

function warn(){
    if(LEVEL.WARN <= globalLevel){
        log(LEVEL.WARN,util.format.apply(this,arguments))
    }
}

function error(){
    if(LEVEL.ERROR <= globalLevel){
        log(LEVEL.ERROR,util.format.apply(this,arguments))
    }
}

function newPrepareStackTrace(error,structuredStack){
    return structuredStack
}

function log(level,message){
    //get call stack and find the caller
    let oldPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = newPrepareStackTrace;
    let structuredStack = new Error().stack
    Error.prepareStackTrace = oldPrepareStackTrace
    let caller = structuredStack[2];

    let lineSep = process.platform == 'win32' ? '\\' :'/'
    let fileNameSplited = caller.getFileName().split(lineSep)
    let fileName = fileNameSplited[fileNameSplited.length - 1]
    let lineNumber = caller.getLineNumber();
    let columnNumber = caller.getColumnNumber();

    let levelString;
    switch (level){
        case LEVEL.INFO:
             levelString = '[INFO]';
             break;
        case LEVEL.WARN:
             levelString = '[WARN]';
             break;     
        case LEVEL.ERROR:
             levelString = '[ERROR]';
             break;  
        default:
             levelString = '[]'
             break;         
    }
    //真正的输出格式化
    let output = util.format('%s %s(%d,%d) %s',
       levelString,fileName,lineNumber,columnNumber,message
    )

    if(!coloredOutput){
        process.stdout.write(output + '\n')
    }else{
        switch(level){
            case LEVEL.INFO:
                process.stdout.write(COLOR.INFO + output +COLOR.RESET + '\n')
                break;
            case LEVEL.WARN:
                process.stdout.write(COLOR.WARN + output +COLOR.RESET + '\n')
                break;     
            case LEVEL.ERROR:
                process.stdout.write(COLOR.WARN + output +COLOR.RESET + '\n')
                break;  
            default:
            
             break;   
        }
    }

}


module.exports = {
    info:info,
    warn:warn,
    error:error,
    LEVEL:LEVEL,
    setLevel:setLevel,
    setColoredOutput:setColoredOutput
}