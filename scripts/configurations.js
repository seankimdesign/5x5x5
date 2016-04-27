globals = {
    stylePath : "public/style",
    scriptPath: "public/script",
    templatePath: "public/template",
    imagePath: "public/image"
}

module.exports = function(extraConfigs){
    var retObj = {};
    for (keys in globals){
        retObj[keys] = globals[keys];
    }
    for (keys in extraConfigs){
        retObj[keys] = extraConfigs[keys];
    }
    return retObj;
}