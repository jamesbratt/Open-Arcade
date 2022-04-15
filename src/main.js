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
    x: 0,
    y: 0,

    get: function() {
        return { x: this.x, y: this.y }
    },

    set: function(x, y) {
        this.x = x;
        this.y = y;
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
        updateGame('left')
    }
    if (keyCodeMap[CONTROLS.MOVE_RIGHT]) {
        horizontalOffset++;
        updateGame('right');
    }
}

const scene = {
    start: 0,
    end: Math.ceil(1000/30),

    renderScene: function(sceneData) {

        let x = 0
        let y = 400

        const tiles = [];

        const generateScene = (nodes, hasParent) => {
            nodes.forEach((node, i) => {
                x = x + 30

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

    const tiles = scene.renderScene(JSON.parse(JSON.stringify(devData)));
    tiles.slice(scene.start, scene.end).forEach((tile, i, { [i-1]: prev, [i+1]: next }) => {
        if (next && next.y < tile.y) {
            fillAscendingTile(tile);
        } else if (prev && prev.y < tile.y) {
           fillDescendingTile(tile)
        }
        fillTile(tile);
        fillVerticalSceneSlice(tile);
    })
    player.set(510, 340); // TODO this cannot be hard coded
}

const fillAscendingTile = ({ x, y }) => {
    context.fillStyle = "green";
    context.beginPath();
    context.moveTo(x + 30, y - 30);
    context.lineTo(x + 30, y);
    context.lineTo(x, y);
    context.fill();
}

const fillDescendingTile = ({ x, y }) => {
    context.fillStyle = "green";
    context.beginPath();
    context.moveTo(x, y - 30);
    context.lineTo(x + 30, y);
    context.lineTo(x, y);
    context.fill();
}

const fillTile = ({ x, y }) => {
    context.fillStyle = "green";
    context.fillRect(x, y, 30, 30);
}

const fillVerticalSceneSlice = (tile) => {
    const space = 600 - tile.y;
    const num = space/30;

    let yCounter = tile.y;
    for (let index = 0; index < num; index++) {
        fillTile({ x: tile.x, y: yCounter + 30 })
        yCounter = yCounter + 30;
    }
} 

const updateGame = (direction) => {
    context.clearRect(0, 0, 1000, 600);
    const tiles = scene.renderScene(JSON.parse(JSON.stringify(devData)));
    const chunkedTiles = tiles.slice((scene.start + horizontalOffset), (scene.end + horizontalOffset)).reduce((acc, curr, i) => {
        return horizontalOffset > 0 ?
            [ ...acc, { x: acc.length === 0 ? 0 : acc[i - 1].x + 30, y: curr.y}] :
                [ ...acc, { x: curr.x, y: curr.y}];
    }, []);

    const currentTileIndex = 15; // TODO this cannot be hard coded

    let NextPosition = null
    if (direction === 'left') {
        NextPosition = chunkedTiles[currentTileIndex - 1];
    }

    if (direction === 'right') {
        NextPosition = chunkedTiles[currentTileIndex + 1];
    }

    if (NextPosition) {
        if (NextPosition.y < chunkedTiles[currentTileIndex].y) {
            verticalOffset = verticalOffset + 30
        }
        if (NextPosition.y > chunkedTiles[currentTileIndex].y) {
            verticalOffset = verticalOffset - 30
        }
    }

    const chunkedTilesWithVerticalOffsetApplied = chunkedTiles.map(tile => ({ ...tile, y: tile.y + verticalOffset }))

    const visibleTiles = chunkedTilesWithVerticalOffsetApplied.filter(tile => tile.y > 30 || tile.y < 570)
    
    visibleTiles.forEach((tile, i, { [i-1]: prev, [i+1]: next }) => {
        if (next && next.y < tile.y) {
            fillAscendingTile(tile);
        } else if (prev && prev.y < tile.y) {
           fillDescendingTile(tile)
        }
        fillTile(tile);
        fillVerticalSceneSlice(tile);
    });

    player.set(NextPosition.x, NextPosition.y + verticalOffset);
}

startGame();

