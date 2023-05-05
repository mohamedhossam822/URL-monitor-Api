const mongoose = require("mongoose");
const User = mongoose.model("User");
const Tag = mongoose.model("Tag");
const UrlCheck = mongoose.model("UrlCheck");
function GetURLDetails(req,res){
    return res.status(200).json("GetURLDetails here");
}

async function  Add(req,res){
    const userId=res.locals.userId ;
    const URL=req.body;
    User.findOne({
        name: URL.name,
        user: userId
      }).then((savedUser) => {
        if (savedUser) {
          return res.status(422).json({
            error: "There is a check with the same name for this user",
          });
        }
    });
    const urlCheck = new UrlCheck(URL);
    try {
         const newurlcheck=await urlCheck.save();
         
         if(newurlcheck.tags!=null) for(let i=0;i<newurlcheck.tags.length;i++){
            const tag=newurlcheck.tags[i];
            let tagDB=await Tag.findOne({name: tag,user:userId });
            if(tagDB==null){
                const newTag = new Tag({name: tag,user:userId});
                tagDB=await newTag.save();
            }
            tagDB.urlChecks.push(newurlcheck._id);
            tagDB.save();
        }
    } catch (e) {
        return res.status(404).json(e);
    }

    return res.status(200).json("URL Check Added successfully");
}

function Update(req,res){
    return res.status(200).json("Updated");
}

function Delete(req,res){
    return res.status(200).json("Deleted");
}

function AddTagsWithCheckNames(req,res){
    return res.status(200).json("Added tags");
}
function GetURLDetailsByTag(req,res){
    return res.status(200).json("GetURLDetailsByTag here");
}

module.exports ={
    GetURLDetails,Add,Update,Delete,AddTagsWithCheckNames,GetURLDetailsByTag
}