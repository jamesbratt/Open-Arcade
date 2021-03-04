export const extractPlatformDataFromBrowser = () => {
    chrome.tabs.executeScript(null, {
        code: `function htmlToJson(div,obj){
            if(!obj){obj=[]}
            var tag = {}
            tag['tagName']=div.tagName
            tag['children'] = []
            for(var i = 0; i< div.children.length;i++){
               tag['children'].push(htmlToJson(div.children[i]))
            }
            for(var i = 0; i< div.attributes.length;i++){
               var attr= div.attributes[i]
               tag['@'+attr.name] = attr.value
            }
            return tag    
           }
        
        chrome.runtime.sendMessage({
            action: "getSource",
            source: htmlToJson(document.body)
        });`
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message)
        }
    })
}
