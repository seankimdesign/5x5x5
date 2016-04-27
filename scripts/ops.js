exports.error = function(msg){
    return {"err":msg}
}

exports.dualColor = function(i){
    var colors = ["blue", "red"]
    return colors[i % 2]
}