fnObj = {};


(function(){

    fnObj.uploadEntry = function(){
        var formDom = document.getElementById('entryUploadForm')
        var inputDom = formDom.uploadEntry
        var idDom = formDom.entryid
        var selectedFile
        if (inputDom.files && inputDom.files.length) selectedFile = inputDom.files[0];
        if (selectedFile){
            var sendData = new FormData()
            sendData.append('uploadEntry', selectedFile, selectedFile.name)
            sendData.append('id', idDom.value)
            ajax.upload(sendData, insertEntry, idDom.value)
        } else{
            alert('No file selected')
        }
    }

    function insertEntry(data, id){
        var parsed = JSON.parse(data)
        if (Array.isArray(parsed) &&
            parsed.hasOwnProperty("entries")){
            //var topicWrapper = elemsByData('topicid', id, 'oneTopic')[0];
            //topicWrapper.getElementsByClassName('topicIcon')[0].innerHTML = '<img src="'+parsed.path+'"/>'

            if (parsed.hasOwnProperty("newChallenge")){
                insertNewChallenge(parsed.newChallenge)
            }

        } else{
            console.log('Error updating entry information');
        }
    }

    function insertNewChallenge(newChallenge){

    }

}())


