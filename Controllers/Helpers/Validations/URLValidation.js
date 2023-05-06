const mongoose = require("mongoose");
const UrlCheck = mongoose.model("UrlCheck");

function validateUrlCheck(urlCheck,isNew){
    //nameValidation
    if(isNew && urlCheck.name==null) return "A name is required for URL Check";
    if(isNew && urlCheck.url==null) return "A url is required for URL Check";
    if(isNew && urlCheck.protocol==null) return "A protocol is required for URL Check";
    if((!isNew && urlCheck.protocol==null) || ( urlCheck.protocol!="HTTPS" && urlCheck.protocol!="HTTP" && urlCheck.protocol!="TCP")) return "Protocol"+urlCheck.protocol+"is not supported, Use HTTP or HTTPS or TCP";
    if(urlCheck.port!=null && isNaN(urlCheck.port)) return "port should be a number";
    if(urlCheck.timeout!=null && isNaN(urlCheck.timeout)) return "timeout should be a number";
    if(urlCheck.interval!=null && isNaN(urlCheck.interval)) return "interval should be a number";
    if(urlCheck.threshold!=null && isNaN(urlCheck.threshold)) return "threshold should be a number";
    if(urlCheck.threshold!=null && isNaN(urlCheck.threshold)) return "threshold should be a number";
    if(urlCheck.authentication!=null && (urlCheck.authentication.username==null || urlCheck.authentication.password==null)) 
        return "authentication should have username and password";

    if(urlCheck.httpHeaders!=null){
        if(!Array.isArray(urlCheck.httpHeaders)) return  "headers should be a list of (key,value)";
        for(let i=0;i<urlCheck.httpHeaders.length;i++){
            const header=urlCheck.httpHeaders[i];
            if(header==null || header.key==null || header.value==null) return  "headers should be a list of (key,value)";
        }
    }

    if(urlCheck.assert!=null && urlCheck.assert.statusCode==null) return  "assert should have a statusCode";
    if(urlCheck.assert!=null && urlCheck.assert.statusCode!=null && isNaN(urlCheck.assert.statusCode)) return  "assert statusCode should be a number";

    if(urlCheck.tags!=null){
        if(!Array.isArray(urlCheck.tags)) return  "tags should be a list of string";
        for(let i=0;i<urlCheck.tags.length;i++){
            const tag=urlCheck.tags[i];
            try{
                urlCheck.tags[i].toString()
            }
            catch(err){
                return  "tags should be a list of string";
            }
        }
    }
    if(urlCheck.ignoreSSL!=null && typeof urlCheck.ignoreSSL !=="boolean") return  "ignoreSSL should be a boolean either true or false";
    if(isNew && urlCheck.protocol=="HTTPS" && urlCheck.ignoreSSL==null)  return  "ignoreSSL required if protocol is HTTPS";
}
module.exports={
    validateUrlCheck
}