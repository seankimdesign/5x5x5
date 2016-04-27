(function(){

    function removeBtnListener(elem){
        var getId = grandParentData(elem, 'topicid');
        if (getId){
            elem.addEventListener('click', function(e){
                e.preventDefault();
                var getId = grandParentData(this, 'topicid')
                var getName = this.parentElement.parentElement.getElementsByTagName('h4')[0].textContent;
                if (window.confirm("Do you really wish to remove "+getName+"?")){
                    ajax.delete('/manage', {"topic":getId}, removeTopic(this.parentElement.parentElement));
                }
            });
        }
    }

    function submitBtnListener(elem){
        elem.addEventListener('click', function(e){
            e.preventDefault();
            var inputElem = this.previousSibling;
            if (inputElem.value.trim().length){
                ajax.post('/manage', {
                    "action": "insert",
                    "type":inputElem.id,
                    "value":inputElem.value.trim()
                }, appendTopic);
                console.log('submission started');
                inputElem.value = "";
            } else{
                alert('Please enter relevant information');
            }
        });
    }

    function modifyActivateListener(elem){
        elem.addEventListener('click', function(e){
            e.preventDefault();
            var formWrapper = this.nextSibling;
            if (hasClass(formWrapper, 'opened')){
                formWrapper.style.display = "none"
                formWrapper.classList.remove('opened')
            } else{
                formWrapper.style.display = "block"
                formWrapper.classList.add('opened')
            }
        })
    }

    function modifyBtnListener(elem){
        elem.addEventListener('click', function(e){
            e.preventDefault();
            var newText = this.previousSibling.value;
            if (newText){
                newText = newText.trim();
                var getId = grandParentData(this.parentElement, 'topicid')
                ajax.post('/manage', {
                    "action": "modify",
                    "topic":getId,
                    "value":newText
                }, updateTopic)
            } else{
                alert('Please enter relevant information');
            }
        })
    }


    function uploadIconListener(elem){
        elem.addEventListener('click', function(e){
            e.preventDefault();
            var inputDom = this.parentElement.uploadIcon;
            var idDom = this.parentElement.topicid;
            var selectedFile;
            if (inputDom.files && inputDom.files.length) selectedFile = inputDom.files[0];
            if (selectedFile){
                var sendData = new FormData()
                sendData.append('uploadIcon', selectedFile, selectedFile.name)
                sendData.append('id', idDom.value)
                ajax.upload(sendData, iconReplace, idDom.value)
            }
        })
    }


    var delBtns = document.getElementsByClassName('removeTopic');
    for (var i = 0; i < delBtns.length; i++) {
        removeBtnListener(delBtns[i]);
    }

    var submitBtns = document.getElementsByClassName('newTopicButton');
    for (var i = 0; i < submitBtns.length; i++) {
        submitBtnListener(submitBtns[i]);
    }

    var modifyActivate = document.getElementsByClassName('modifyTopic');
    for (var i = 0; i < modifyActivate.length; i++) {
        modifyActivateListener(modifyActivate[i]);
    }

    var modifyBtns = document.getElementsByClassName('submitEdit');
    for (var i = 0; i < modifyBtns.length; i++) {
        modifyBtnListener(modifyBtns[i]);
    }

    var uploadBtns = document.getElementsByClassName('iconUploader');
    for (var i = 0; i < uploadBtns.length; i++) {
        uploadIconListener(uploadBtns[i]);
    }

    function appendTopic(data){
        if (data){
            var parsed = JSON.parse(data);
            if (parsed.err){
                console.log(parsed.err);
            } else{
                var containerId;
                if (parsed.designation == "drawing") containerId = "drawingForm";
                if (parsed.designation == "design") containerId = "designForm";
                if (containerId){
                    dust.render('singletopic', parsed, function(err, output) {
                        var outputElem = convertDom(output);
                        removeBtnListener(outputElem.getElementsByClassName('removeTopic')[0]);
                        uploadIconListener(outputElem.getElementsByClassName('iconUploader')[0])
                        if (err){
                            console.log(err);
                        } else{
                            insertDomBefore(outputElem, document.getElementById(containerId));
                        }
                    });
                }
                console.log('POST successful');
            }
        }
    }

    function removeTopic(domElem){
        domElem.remove();
    }

    function updateTopic(data){
        var parsed = JSON.parse(data)
        var getId = parsed._id;
        var newName = parsed.name;
        if (getId && newName){
            var topicWrapper = elemsByData('topicid', getId, 'oneTopic')[0];
            if (typeof topicWrapper == 'object'){
                var topicDom = topicWrapper.getElementsByClassName('topicName')[0];
                var inputDom = topicWrapper.getElementsByClassName('editName')[0];
                var modifyWrapper = topicWrapper.getElementsByClassName('modifyForm')[0];
                topicDom.textContent = newName
                inputDom.value = ""
                modifyWrapper.classList.remove('opened')
                modifyWrapper.style.display = "none"
            }
        }
    }

    function uploadProgress(data){
        if (data.lengthComputable){
            console.log(Math.round((data.loaded / data.total)* 100));
        }
    }

    function iconReplace(data, id){
        var parsed = JSON.parse(data)
        if (parsed.hasOwnProperty('path')){
            var topicWrapper = elemsByData('topicid', id, 'oneTopic')[0];
            topicWrapper.getElementsByClassName('topicIcon')[0].innerHTML = '<img src="'+parsed.path+'"/>'
        } else{
            console.log('Error updating icon information');
        }

    }

    function grandParentData(elem, fieldName){
        if (elem.parentElement.parentElement.dataset.hasOwnProperty(fieldName)){
            return elem.parentElement.parentElement.dataset[fieldName];
        } else{
            return null;
        }
    }

}());