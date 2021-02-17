import Phaser from 'phaser'
import GameScene from './scenes/Game'
import config from './config'

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
            console.log(chrome.runtime.lastError.message)
        }
    })
}

if (process.env.NODE_ENV === 'production') {
    chrome.runtime.onMessage.addListener((request, sender) => {
        if (request.action === 'getSource') {
            const gameConfig = Object.assign(config, {
                scene: [GameScene]
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

    window.onload = onWindowLoad
} else {
    const gameConfig = Object.assign(config, {
        scene: [GameScene]
    })

    class Game extends Phaser.Game {
        constructor () {
            super(gameConfig)
        }
    }

    const devData = require('../dev-data.json')

    window.gameData = devData

    window.game = new Game()
}
