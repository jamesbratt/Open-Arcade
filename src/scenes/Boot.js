import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class extends Phaser.Scene {
    constructor () {
        super({ key: 'BootScene' })
    }

    preload () {
        this.fontsReady = false
        this.fontsLoaded = this.fontsLoaded.bind(this)
        this.add.text(100, 100, 'loading fonts...')

        this.load.image('loaderBg', './assets/images/loader-bg.png')
        this.load.image('loaderBar', './assets/images/loader-bar.png')
        this.load.image('tile', './assets/images/tile.png')
        this.load.spritesheet('dude',
            './assets/images/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        )

        WebFont.load({
            google: {
                families: ['Bangers']
            },
            active: this.fontsLoaded
        })
    }

    update () {
        if (this.fontsReady) {
            this.scene.start('SplashScene')
        }
    }

    fontsLoaded () {
        this.fontsReady = true
    }
}
