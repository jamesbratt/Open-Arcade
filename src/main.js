import Phaser from 'phaser'

import BootScene from './scenes/Boot'
import SplashScene from './scenes/Splash'
import GameScene from './scenes/Game'

import config from './config'

chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.action === 'getSource') {
        console.log(JSON.stringify(request.source))

        const gameConfig = Object.assign(config, {
            scene: [BootScene, SplashScene, GameScene]
        })

        class Game extends Phaser.Game {
            constructor () {
                super(gameConfig)
            }
        }

        window.gameData = request.source
        window.game = new Game()
    }
})

function onWindowLoad () {
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
            console.log(chrome.runtime.lastError.message);
        }
    })
}

window.onload = onWindowLoad
