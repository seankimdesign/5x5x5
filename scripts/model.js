exports.newTopic = function(name, designation){
    return {
        "name": name,
        "isActive": true,
        "designation": designation,
        "iconSrc": null,
        "challenges": []
    }
}

exports.newChallenge = function(topicid){
    return{
        "topic": topicid,
        "isCurrent": true,
        "dateCreated": new Date(),
        "dateClosed": null,
        "entries": []
    }
}

exports.newEntry = function(name, src, challenge, detail, order){
    return {
        "name": name,
        "entrySrc": src,
        "challenge": challenge,
        "detail": detail,
        "order": order,
        "entryDate": new Date()
    }
}