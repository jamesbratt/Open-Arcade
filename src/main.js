const devData = require('../fixtures/dev-data.json')

console.log('Starting Open Arcade')

var CONTROLS = {
    MOVE_LEFT: 'ArrowLeft',
    MOVE_RIGHT: 'ArrowRight',
};

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let keyCodeMap = {};
let horizontalOffset = 0;

const player = {
    x: 500,
    y: 300,

    get: function() {
        return { x: this.x, y: this.y }
    },

    set: function() {
        // this.x = x;
        // this.y = y;

        context.fillStyle = "blue";
        context.fillRect(this.x, this.y, 30, 30);
        return { x: this.x, y: this.y }
    }
}
/*
const camera = {
    x: 500,
    y: 300,
    hOffset: 0,
    vOffset: 0,
    
    get: function() {
        const { x, y, hOffset, vOffset } = this;
        return { x, y, hOffset, vOffset }
    }, 

    incHoffset: function() {
        this.hOffset = this.hOffset + 1;
        const { x, y } = this;
        return { x, y }
    },

    incVoffset: function() {
        this.vOffset = this.vOffset + 1;
        const { x, y } = this;
        return { x, y }
    } 
}*/

const controlPlayer = (e) => {
    keyCodeMap[e.code] = e.type == 'keydown';
    if (keyCodeMap[CONTROLS.MOVE_LEFT]) {
        if (horizontalOffset > 0) {
            --horizontalOffset;
        }
        updateGame()
       /* const { x, y } = player.get();
        updateGame({ updatedPlayer: { x: x - 30, y } })*/
    }
    if (keyCodeMap[CONTROLS.MOVE_RIGHT]) {
        horizontalOffset++;
        updateGame();
        /*const { x, y } = player.get();
        const { x: cameraX, y: cameraY } = camera.get();

        const isChangeInCameraOffsetH = (x >= cameraX);
        const isChangeInCameraOffsetV = (y <= cameraY);
        console.log(isChangeInCameraOffsetH + '-' + isChangeInCameraOffsetV);

        if (!isChangeInCameraOffsetH || !isChangeInCameraOffsetV) {
            updateGame({ updatedPlayer: { x: x + 30, y } })
        } else {
            if (isChangeInCameraOffsetH) {
                camera.incHoffset();
            }
    
            if (isChangeInCameraOffsetV) {
                camera.incVoffset();
            }
    
            updateGame({ updatedPlayer: { x, y: isChangeInCameraOffsetV ? y + 30 : y } })
        }*/

    }
}

const scene = {
    start: 0,
    end: Math.ceil(1000/30),

    renderScene: function(sceneData) {

        let x = -15
        let y = 400

        const tiles = [];

        const generateScene = (nodes, hasParent) => {
            nodes.forEach((node, i) => {
                x = x + ((30 / 2) + 15)

                if (i === (nodes.length - 1)) {
                    y = y + 30
                }

                if (i < (nodes.length - 1) || hasParent) {
                    tiles.push({ x, y });
                }

                if (node.children.length > 0) {
                    node.children.push({ children: [] })
                    y = y - 30
                    generateScene(node.children, true)
                }
            })
        }

        generateScene(sceneData.children, false)

        return tiles;
    }
}

const startGame = () => {
    document.addEventListener('keyup', controlPlayer);
    document.addEventListener('keydown', controlPlayer);

    player.set();
    const tiles = scene.renderScene(JSON.parse(JSON.stringify(devData)));
    tiles.slice(scene.start, scene.end).forEach(tile => {
        context.fillStyle = "red";
        context.fillRect(tile.x, tile.y, 30, 30);
    })
}

const checkForIntersection = (updatedPlayer, tiles) => {
    const playerMaxX = updatedPlayer.x + 30;

    const intersections = tiles.filter(tile => {
        const tileMinX = tile.x;
        const tileMaxX = tile.x + 30;
    
        if(playerMaxX > tileMinX && playerMaxX < tileMaxX) {
            return tile
        };
    });

    return intersections.length > 0 ? intersections[intersections.length - 1] : null;
}

const updateGame = () => {
    context.clearRect(0, 0, 1000, 600);

    // const { hOffset, vOffset } = camera.get();

    const tiles = scene.renderScene(JSON.parse(JSON.stringify(devData)));
    const chunkedTiles = tiles.slice((scene.start + horizontalOffset), (scene.end + horizontalOffset)).reduce((acc, curr, i) => {
        return horizontalOffset > 0 ?
            [ ...acc, { x: acc.length === 0 ? 0 : acc[i - 1].x + ((30 / 2) + 15), y: curr.y}] :
                [ ...acc, { x: curr.x, y: curr.y}];
    }, []);

    const foo = chunkedTiles.filter(tile => tile.y > 30 || tile.y < 570)

    /*const chunkedTiles = hChunkedTiles.reduce((acc, curr, i) => {
        return vOffset > 0 ?
            [ ...acc, { x: curr.x, y: curr.y + 30}] :
                [ ...acc, { x: curr.x, y: curr.y}];
    }, []);*/
    
    foo.forEach(tile => {
        context.fillStyle = "red";
        context.fillRect(tile.x, tile.y, 30, 30);
    });

    player.set();

    /*const intersectedTile = checkForIntersection(updatedPlayer, chunkedTiles);

    if (!intersectedTile) {
        player.set(updatedPlayer);
    }

    if (intersectedTile.y < updatedPlayer.y + 30) {
        player.set({ x: updatedPlayer.x, y: updatedPlayer.y - 30 });
    } else if (intersectedTile.y > updatedPlayer.y + 30) {
        player.set({ x: updatedPlayer.x, y: updatedPlayer.y + 30 });
    } else {
        player.set(updatedPlayer);
    }*/
}

startGame();

