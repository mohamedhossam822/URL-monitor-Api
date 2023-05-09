import mongoose from 'mongoose';
const User = mongoose.model("User");
const Tag = mongoose.model("Tag");
const UrlCheck = mongoose.model("UrlCheck");
import { addOrGetTag ,deleteUrlinTags,deleteEmptyTags} from "./Helpers/DatabaseHelper.js";
import { validateUrlCheck } from "./Helpers/Validation.js";
import {makeARequest} from"../URLMonitoring.js";

//GET Request : get url details
async function  getURLDetails(req,res){
    //Get URL name and userId
    const checkName= req.params.checkName;
    const userId=res.locals.userId ;

    //Check if URL exist
    const savedUrl=await UrlCheck.findOne({name: checkName,user: userId});
    if(savedUrl==null)     return res.status(404).json("User Not Found");

    //Calculate avaiability and send URL info to the user
    savedUrl._id=undefined;
    savedUrl.user= undefined;
    savedUrl.__v= undefined;
    savedUrl.lastTimeStampMs=undefined;
    savedUrl.availability=(savedUrl.upTime/(savedUrl.downtime+savedUrl.upTime)) * 100 +"%";
    return res.status(200).json(savedUrl);
}

//POST Request : make a new url Check
async function  addURLCheck(req,res){
    //Get URL Info and userId
    const userId=res.locals.userId ;
    const URL=req.body;
    let checkTags=[];

    //Validate UrlForm
    const error=validateUrlCheck(URL,true);
    if(error!=null) return res.status(422).json({error: error});


    //Check If A check already exists with this name
    const savedUrl=await UrlCheck.findOne({name: urlCheck.name,user: userId});
    if (savedUrl) return res.status(422).json({error: "There is a check with the same name for this user"});
    
    //Check for tags
    if(URL.tags!=null){
        checkTags=URL.tags;
    }

    //Create UrlCheck and save it
    const urlCheck = new UrlCheck(URL);
    urlCheck.user=userId;
    const newurlcheck=await urlCheck.save();

    //Add the check to tags sent , if they don't exist create them
    for(let i=0;i<checkTags.length;i++){
        const currentTag=await addOrGetTag(checkTags[i],userId);
        currentTag.urlChecks.push(newurlcheck._id);
        currentTag.save();
    }
    //queue URL Check to URL Monitoring process
    makeARequest(urlCheck);
    return res.status(200).json("URL Check Added successfully");
}

//PUT Request : Update the URL Check
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
    const newTagsSet=new Set(URL.tags);


    //Update Headers Array
    const oldHeaders = savedUrl.httpHeaders;
    if(URL.httpHeaders!=null && oldHeaders!=null){
        const newHeadersSet=new Set();
        //Make a list containning unique old and new headers 
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

    //Excute pending updates
    await UrlCheck.findOneAndUpdate({_id: savedUrl._id}, URL);

    return res.status(200).json("URL Check Updated successfully");
}

//Delete Request : Delete URL check
async function deleteURLCheck(req,res){
    //Get URL Name and userId
    const checkName= req.params.checkName;
    const userId=res.locals.userId ;
    //check if URL exists
    const URL=await UrlCheck.findOne({ name: checkName,user:userId });
    if (UrlCheck==null) return res.status(404).json({error: "There is no check with that name , Create new one first"});
    const urlId=URL._id;
    const tags=URL.tags;

    //Delete Url from tags
    await deleteUrlinTags(tags,urlId,userId);

    //Remove any empty tag
    //Pending improvment send tags that got deleted from only to reduce number of iteration in all tags
    deleteEmptyTags();
    //Delete URL
    await UrlCheck.deleteOne({ _id: urlId });
    return res.status(200).json("Deleted");
}

//  Add new or existing tags with existing URL Names
async function addTagsWithCheckNames(req,res){
    //Get list of tags and their URL names and userId
    const userId=res.locals.userId ;
    const tags=req.body;

    for(let i=0;i<tags.length;i++){
        const tagName=tags[i].name;
        const checks=tags[i].checks;
        const tag=await addOrGetTag(tagName,userId);

        //Add existing checks of tag to hashset to improve iterating over them in next operation
        const existingChecks=new Set();
        tag.urlChecks.forEach(item=> existingChecks.add(item.toString()));

        for(let j=0;j<checks.length;j++){
            //Check if URL Name exist and its not in the tag already
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

//GET Request: Get URL Info by tag
async function getURLDetailsByTag(req,res){
    //Get tagName and userId
    const tagName= req.params.tagName;
    const userId=res.locals.userId ;
    //Check if tag exists
    const tag = await Tag.findOne({name: tagName,user: userId}).populate('urlChecks');
    if(tag==null)     return res.status(404).json("tag Not found");

    //format URL checks and calculate availability and send it
    tag.urlChecks.forEach(check=>{
        check._id=undefined;
        check.user=undefined;
        check.__v=undefined;
        check.lastTimeStampMs=undefined;
        check.availability=(check.upTime/(check.downtime+check.upTime)) * 100 +"%";
    });
    return res.status(200).json(tag.urlChecks);
}

export {
    getURLDetails,addURLCheck,updateURLCheck,deleteURLCheck,addTagsWithCheckNames,getURLDetailsByTag
}