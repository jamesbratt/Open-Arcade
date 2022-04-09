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
let verticalOffset = 0;

const player = {
    x: 500,
    y: 300,

    get: function() {
        return { x: this.x, y: this.y }
    },

    set: function() {
        context.fillStyle = "blue";
        context.fillRect(this.x, this.y, 30, 30);
        return { x: this.x, y: this.y }
    }
}

const controlPlayer = (e) => {
    keyCodeMap[e.code] = e.type == 'keydown';
    if (keyCodeMap[CONTROLS.MOVE_LEFT]) {
        if (horizontalOffset > 0) {
            --horizontalOffset;
        }
        updateGame()
    }
    if (keyCodeMap[CONTROLS.MOVE_RIGHT]) {
        horizontalOffset++;
        updateGame();
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

const checkForIntersection = (foo) => {
    const playerMaxX = 530;

    const intersections = foo.filter(tile => {
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
    const tiles = scene.renderScene(JSON.parse(JSON.stringify(devData)));
    const chunkedTiles = tiles.slice((scene.start + horizontalOffset), (scene.end + horizontalOffset)).reduce((acc, curr, i) => {
        return horizontalOffset > 0 ?
            [ ...acc, { x: acc.length === 0 ? 0 : acc[i - 1].x + ((30 / 2) + 15), y: curr.y + verticalOffset}] :
                [ ...acc, { x: curr.x, y: curr.y + verticalOffset}];
    }, []);

    const intersectedTile = checkForIntersection(chunkedTiles);

    if (intersectedTile.y < 330) {
        console.log('up')
        verticalOffset = verticalOffset + 30
    } else if (intersectedTile.y > 330) {
        console.log('down')
        verticalOffset = verticalOffset - 30
    } else {
        console.log('straight')
    }

    const visibleTiles = chunkedTiles.filter(tile => tile.y > 30 || tile.y < 570)
    
    visibleTiles.forEach(tile => {
        context.fillStyle = "red";
        context.fillRect(tile.x, tile.y, 30, 30);
    });

    player.set();
}

startGame();

