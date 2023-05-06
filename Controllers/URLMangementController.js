const mongoose = require("mongoose");
const User = mongoose.model("User");
const Tag = mongoose.model("Tag");
const UrlCheck = mongoose.model("UrlCheck");
const { addOrUpdateTag ,deleteUrlinTags,deleteEmptyTags} = require("./Helpers/DatabaseHelper.js");
const { validateUrlCheck } = require("./Helpers/Validation.js");
async function  getURLDetails(req,res){
    const checkName= req.params.checkName;
    const userId=res.locals.userId ;
    const savedUrl=await UrlCheck.findOne({name: checkName,user: userId});
    savedUrl.user= undefined;
    savedUrl.__v= undefined;
    return res.status(200).json(savedUrl);
}

async function  addURLCheck(req,res){
    const userId=res.locals.userId ;
    const URL=req.body;
    let checkTags=[];

    //Validate UrlForm
    const error=validateUrlCheck(URL,true);
    if(error!=null) return res.status(422).json({error: error});
    const urlCheck = new UrlCheck(URL);

    //Check If A check already exists with this name
    const savedUrl=await UrlCheck.findOne({name: urlCheck.name,user: userId});
    if (savedUrl) return res.status(422).json({error: "There is a check with the same name for this user"});
    
    //Check for tags
    if(URL.tags!=null){
        checkTags=URL.tags;
    }

    //Create UrlCheck and save it
    urlCheck.user=userId;
    const newurlcheck=await urlCheck.save();

    //Add tags for the check if exist
    for(let i=0;i<checkTags.length;i++){
        const currentTag=await addOrUpdateTag(checkTags[i],userId);
        currentTag.urlChecks.push(newurlcheck._id);
        currentTag.save();
    }

    return res.status(200).json("URL Check Added successfully");
}

async function  updateURLCheck(req,res){
    const userId=res.locals.userId ;
    const URL=req.body;
    let checkTags=[];

    //Validate UrlForm
    const error=validateUrlCheck(URL,false);
    if(error!=null) return res.status(422).json({error: error});
    
    //Get the record to update
    var savedUrl=await UrlCheck.findOne({name: URL.name,user: userId});
    if (savedUrl==null) return res.status(422).json({error: "There is no check with that name , Create new one first"});
    
    //Check for tags
    if(URL.tags!=null){
        checkTags=URL.tags;
    }

    //Create UrlCheck and save it
    const oldTags = savedUrl.tags;
    const oldTagsSet=new Set(oldTags);
    const oldHeaders = savedUrl.httpHeaders;

    const newTagsSet=new Set(URL.tags);
    //Update Headers Array
    if(URL.httpHeaders!=null && oldHeaders!=null){
        
        const newHeadersSet=new Set();
        URL.httpHeaders.forEach(element=> newHeadersSet.add(element.key+":"+element.value));
            oldHeaders.forEach(element => {
                if(!newHeadersSet.has(element.key+":"+element.value)) URL.httpHeaders.push(element);
            });
    }


    //Add tags for the check if exist
    for(let i=0;i<checkTags.length;i++){
        if(oldTagsSet.has(checkTags[i])) continue;
        const currentTag=await addOrUpdateTag(checkTags[i],userId);
        currentTag.urlChecks.push(savedUrl._id);
        currentTag.save();
    }

    //Update tags array
    if(URL.tags!=null)oldTags.forEach(element => {
        if(!newTagsSet.has(element)) URL.tags.push(element);
    });

    await UrlCheck.findOneAndUpdate({_id: savedUrl._id}, URL);

    return res.status(200).json("URL Check Updated successfully");
}

async function deleteURLCheck(req,res){
    const checkName= req.params.checkName;
    const userId=res.locals.userId ;
    const URL=await UrlCheck.findOne({ name: checkName,user:userId });
    const urlId=URL._id;
    const tags=URL.tags;
    await deleteUrlinTags(tags,urlId,userId);
    deleteEmptyTags();
    await UrlCheck.deleteOne({ _id: urlId });
    return res.status(200).json("Deleted");
}

async function addTagsWithCheckNames(req,res){
    const userId=res.locals.userId ;
    const tags=req.body;
    for(let i=0;i<tags.length;i++){
        const tagName=tags[i].name;
        const checks=tags[i].checks;
        const tag=await addOrUpdateTag(tagName,userId);

        const existingChecks=new Set();
        tag.urlChecks.forEach(item=> existingChecks.add(item.toString()));

        for(let j=0;j<checks.length;j++){
            const check=await UrlCheck.findOne({name : checks[j],user :userId});
            if(check==null) continue;
            if(existingChecks.has(check._id.toString())) continue;

            //add tag name to tags array in check
            check.tags.push(tagName);
            check.save();

            //add check id to tag record
            tag.urlChecks.push(check._id);
        }

        tag.save();
    }
    return res.status(200).json("Saved Successfully");
}

async function getURLDetailsByTag(req,res){
    const tagName= req.params.tagName;
    const userId=res.locals.userId ;
    const tag = await Tag.findOne({name: tagName,user: userId}).populate('urlChecks');
    tag.urlChecks.forEach(check=>{
        check.user=undefined;
        check.__v=undefined;
        check._id=undefined;
    });
    return res.status(200).json(tag.urlChecks);
}

module.exports ={
    getURLDetails,addURLCheck,updateURLCheck,deleteURLCheck,addTagsWithCheckNames,getURLDetailsByTag
}