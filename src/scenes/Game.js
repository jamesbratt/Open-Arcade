/* globals __DEV__ */
import Phaser from 'phaser'
import { extractPlatformDataFromBrowser } from '../utils'

export default class extends Phaser.Scene {
    constructor () {
        super({ key: 'GameScene' })
        this.cursors = null
        this.player = null
        this.platforms = null
    }

    refreshGame () {
        this.platforms.clear(true, true)
        this.player.destroy()
        this.startGame()
    }

    startGame () {
        this.platforms = this.physics.add.staticGroup()
        this.player = this.physics.add.sprite(100, 300, 'dude')
        this.cameras.main.setBounds(0, 0, 10000, 100)
        this.physics.world.setBounds(0, 0, 10000, 600)
        this.cameras.main.startFollow(this.player)
        this.physics.add.collider(this.player, this.platforms)
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)
    }

    renderScene (sceneData) {
        let x = -15
        let y = 580

        const generateScene = (nodes, hasParent) => {
            nodes.forEach((node, i) => {
                x = x + ((30 / 2) + 20)

                if (i === (nodes.length - 1)) {
                    y = y + 30
                }

                if (i < (nodes.length - 1) || hasParent) {
                    this.platforms.create(x, y, 'tile')
                }

                if (node.children.length > 0) {
                    node.children.push({ children: [] })
                    y = y - 30
                    generateScene(node.children, true)
                }
            })
        }

        generateScene(sceneData.children, false)
    }

    preload () {
        this.load.image('tile', './assets/images/tile.png')
        this.load.spritesheet('dude',
            './assets/images/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        )
    }

    create () {
        /**
         * TODO: Design some kind of harness for the game to run in.
         * As when developing the game it is much easier to run the game
         * in a web browser as opposed to inside a chrome extension
         */
        if (process.env.NODE_ENV === 'production') {
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === 'complete') {
                    this.refreshGame()
                    extractPlatformDataFromBrowser()
                };
            })

            chrome.runtime.onMessage.addListener((request, sender) => {
                if (request.action === 'getSource') {
                    this.renderScene(request.source)
                }
            })

            this.startGame()
            extractPlatformDataFromBrowser()
        } else {
            const devData = require('../../dev-data.json')
            this.startGame()
            this.renderScene(devData)
        }

        this.cursors = this.input.keyboard.createCursorKeys()

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
    }

    update () {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160)

            this.player.anims.play('left', true)
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160)
            this.player.anims.play('right', true)
        } else {
            this.player.setVelocityX(0)
            this.player.anims.play('turn')
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-150)
        }
    }
}
