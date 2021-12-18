const devData = require('../fixtures/dev-data.json')

console.log('Starting Open Arcade')

var CONTROLS = {
    MOVE_LEFT: 'ArrowLeft',
    MOVE_RIGHT: 'ArrowRight',
};

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let keyCodeMap = {};

const player = {
    x: 0,
    y: 370,

    get: function() {
        return { x: this.x, y: this.y }
    },

    set: function({x, y}) {
        this.x = x;
        this.y = y;

        context.fillStyle = "blue";
        context.fillRect(x, y, 30, 30);
        return { x: this.x, y: this.y }
    }
}

const camera = {
    x: 950,
    y: 300,
    offset: 0,
    
    get: function() {
        const { x, y, offset } = this;
        return { x, y, offset }
    }, 

    set: function() {
        this.offset = this.offset + 1;
        const { x, y } = this;
        return { x, y }
    } 
}

const controlPlayer = (e) => {
    keyCodeMap[e.code] = e.type == 'keydown';
    if (keyCodeMap[CONTROLS.MOVE_LEFT]) {
        const { x, y } = player.get();
        updateGame({ updatedPlayer: { x: x - 10, y } })
    }
    if (keyCodeMap[CONTROLS.MOVE_RIGHT]) {
        const { x, y } = player.get();
        const { x: cameraX } = camera.get();

        if (x >= cameraX) {
            camera.set(30);
            updateGame({ updatedPlayer: { x, y } })
        } else {
            updateGame({ updatedPlayer: { x: x + 10, y } })
        }
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

    player.set({x: 20, y: 370});
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

const updateGame = ({ updatedPlayer }) => {
    context.clearRect(0, 0, 1000, 600);

    const { offset } = camera.get();

    const tiles = scene.renderScene(JSON.parse(JSON.stringify(devData)));
    const chunkedTiles = tiles.slice((scene.start + offset), (scene.end + offset)).reduce((acc, curr, i) => {
        return offset > 0 ?
            [ ...acc, { x: acc.length === 0 ? 0 : acc[i - 1].x + ((30 / 2) + 15), y: curr.y}] :
                [ ...acc, { x: curr.x, y: curr.y}];
    }, [])
    
    chunkedTiles.forEach(tile => {
        context.fillStyle = "red";
        context.fillRect(tile.x, tile.y, 30, 30);
    });

    const intersectedTile = checkForIntersection(updatedPlayer, chunkedTiles);

    if (!intersectedTile) {
        player.set(updatedPlayer);
    }

    if (intersectedTile.y < updatedPlayer.y + 30) {
        player.set({ x: updatedPlayer.x, y: updatedPlayer.y - 10 });
    } else if (intersectedTile.y > updatedPlayer.y + 30) {
        player.set({ x: updatedPlayer.x, y: updatedPlayer.y + 10 });
    } else {
        player.set(updatedPlayer);
    }
}

startGame();

