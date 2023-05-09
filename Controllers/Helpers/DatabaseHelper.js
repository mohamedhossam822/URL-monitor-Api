import mongoose from "mongoose";
const Tag = mongoose.model("Tag");

//Add or get Tag
async function addOrGetTag(tag,userId){
    let currentTag=await Tag.findOne({name: tag,user:userId });
    if(currentTag==null){
        const newTag = new Tag({name: tag,user:userId});
        currentTag=await newTag.save();
    }
    return currentTag;
}

//Update the tags if a url is deleted 
async function deleteUrlinTags(tags,urlId,userId){
    for(let i=0;i<tags.length;i++){
        const currTag=tags[i];
        await Tag.updateOne({name: currTag,user: userId},{$pull:{urlChecks: urlId}});
    }
}

//Delete any empty tag
async function deleteEmptyTags(){
    await Tag.deleteMany({ urlChecks: { $exists: true, $size: 0 } });
}

export {
    addOrGetTag,deleteUrlinTags,deleteEmptyTags
}