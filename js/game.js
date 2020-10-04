const WIDTH = 1024;
const HEIGHT = 768;

const RABBIT_DEFAULT_MAX_MOMENTUM = 1.5;
const RABBIT_DEFAULT_ACCELERATION = 0.01;

RABBIT_MAX_MOMENTUM = 1.5;
RABBIT_ACCELERATION = 0.01;
RABBIT_SPEED_DECAY = 0.98;

debug = false;

function PlayState() {
    let status = 'starting';
    let level = 3;
    let bg;
    let wolves;
    let obstacles;
    let carrot;
    let quadtree = new jaws.QuadTree();
    let tileMap;

    this.setup = function () {
        let tileMap = jaws.TileMap({
            size: [WIDTH / 32, HEIGHT / 32],
            cell_size: [32, 32]
        })

        bg = new jaws.Sprite({"image": "images/grass.png"});
        wolves = new jaws.SpriteList();
        rabbit = Rabbit.create(0, 0, wolves);
        obstacles = new jaws.SpriteList();
        carrot = Carrot.create();

        if (!originalMap) {
            originalMap = [];

            for (var x = 0; x < 32; ++x) {
                originalMap.push([]);

                for (var y = 0; y < 24; ++y) {
                    originalMap[x][y] = 0;
                }
            }

            for (var i = 0; i < 200; ++i) {
                originalMap[getRandomInt(32)][getRandomInt(24)] = 'obstacle';
            }

            jaws.context.drawImage(document.getElementById('map'), 0, 0, 32, 24);
            mapData = Array.from(jaws.context.getImageData(0, 0, 32, 24).data);

            for (var y = 0; y < 24; ++y) {
                for (var x = 0; x < 32; ++x) {
                    let r = mapData.shift();
                    let g = mapData.shift();
                    let b = mapData.shift();
                    let a = mapData.shift();

                    if (r == 0 && g == 0 && b == 255) {
                        originalMap[x][y] = 0;
                    }

                    if (r == 255 & g == 0 && b == 0) {
                        originalMap[x][y] = 'rabbit';
                    }

                    if (r == 0 & g == 255 && b == 0) {
                        originalMap[x][y] = 'carrot';
                    }

                    if (r == 0 && g == 0 && b == 0) {
                        originalMap[x][y] = 'flower';
                    }
                }
            }

            console.log(mapData);
        }


        for (var x = 0; x < 32; ++x) {
            for (var y = 0; y < 24; ++y) {
                let cell = originalMap[x][y];

                if (cell === 'rabbit') {
                    rabbit.x = x * 32;
                    rabbit.y = y * 32;
                }

                if (cell === 'carrot') {
                    carrot.x = x * 32;
                    carrot.y = y * 32;
                }

                if (cell === 'flower') {
                    obstacles.push(Obstacle.create(
                        x * 32,
                        y * 32,
                        "images/flower.png"
                    ));
                }

                if (cell === 'obstacle') {
                    obstacles.push(Obstacle.create(x * 32, y * 32));
                }

                if (cell === 'wolf1') {
                    wolves.push(Wolf.createWolf1(
                        x * 32,
                        y * 32,
                        rabbit,
                        obstacles,
                        tileMap
                    ));
                }

                if (cell === 'wolf2') {
                    wolves.push(Wolf.createWolf2(
                        x * 32,
                        y * 32,
                        rabbit,
                        obstacles,
                        tileMap
                    ));
                }

                if (cell === 'wolf3') {
                    wolves.push(Wolf.createWolf3(
                        x * 32,
                        y * 32,
                        rabbit,
                        obstacles,
                        tileMap
                    ));
                }
            }
        }

        let newWolfX = getRandomInt(32);
        let newWolfY = getRandomInt(24);

        while (originalMap[newWolfX][newWolfY] != 0) {
            newWolfX = getRandomInt(32);
            newWolfY = getRandomInt(24);
        }

        let wolfDifficulty;

        if (score < 5) {
            wolfDifficulty = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2][getRandomInt(9)]
        } else if (score < 10) {
            wolfDifficulty = [1, 1, 1, 1, 2, 2, 2, 2, 2, 3][getRandomInt(9)]
        } else if (score < 20) {
            wolfDifficulty = [1, 1, 2, 2, 2, 2, 3, 3, 3, 3][getRandomInt(9)]
        }

        originalMap[newWolfX][newWolfY] = 'wolf' + wolfDifficulty;

        if (debug) {
            carrot.x = 100;
            carrot.y = 100;
        }

        tileMap.push(obstacles);
        wolves.sprites.forEach((w) => w.tileMap = tileMap);
        wolves.sprites.forEach((w) => w.updateItinerary());
        rabbit.wolves = wolves;
        obstaclesHitBoxes = obstacles.map((o) => o.hitbox);

        playingPlanned = Date.now() + 1000;
    }

    this.update = function () {
        if (status === 'starting') {
            if (Date.now() >= playingPlanned) {
                status = 'playing';
            }
        }

        if (status === 'dying' || status === 'winning') {
            return;
        }

        rabbit.hitList = [];

        quadtree.collide(rabbit.obstacleHitbox, carrot, (r, c) => {
            status = 'winning';
            money++;
            score++;
            rabbit.momentum[0] = 2;
            startWhiteTransition(() => jaws.switchGameState(RewardState));
        });

        quadtree.collide(rabbit.obstacleHitbox, obstaclesHitBoxes, (r, h) => {
            rabbit.hitList.push(h);
        });

        handleControls(rabbit);
        rabbit.update();

        wolves.forEach((w) => {
            w.setImage(w.currentAnimation.next());
            w.update();
        });

        quadtree.collide(rabbit.hitbox, wolves, (r, w) => {
            if (w.getStatus() !== 'chasing_rabbit') {
                return;
            }

            if (rabbit.status === 'dead') {
                return;
            }

            rabbit.die();
            startTransition(() => jaws.switchGameState(GameoverState));
        });

        carrot.update();
    }

    this.draw = function () {
        jaws.clear();
        let thingsToDraw = [
            bg,
            rabbit,
            carrot,
        ];

        wolves.forEach((w) => thingsToDraw.push(w));
        obstacles.forEach((o) => thingsToDraw.push(o));

        thingsToDraw = thingsToDraw.sort((a, b) => {
            if (a.y < b.y) {
                return -1;
            }

            if (a.y > b.y) {
                return 1;
            }

            return 0;
        });

        thingsToDraw.forEach((t) => t.draw());

        if (debug) {
            obstacles.sprites.forEach((o) => {
                if (o.hitbox.collidesWith(rabbit.obstacleHitbox)) {
                        jaws.Sprite({x: o.x, y: o.y, image: "images/rect.png"}).draw();
                }
            });
        }

        transitionDraw();
    }

    function isOutsideCanvas(item) {
        return (item.x < 0 || item.y < 0 || item.x > canvas.width || item.y > canvas.height);
    }
}

window.onload = function() {
    jaws.assets.add(
        "images/grass.png",
        "images/rabbit.png",
        "images/wolf1-walk-right.png",
        "images/wolf1-walk-left.png",
        "images/wolf1-run-right.png",
        "images/wolf1-run-left.png",
        "images/wolf2-walk-right.png",
        "images/wolf2-walk-left.png",
        "images/wolf2-run-right.png",
        "images/wolf2-run-left.png",
        "images/wolf3-walk-right.png",
        "images/wolf3-walk-left.png",
        "images/wolf3-run-right.png",
        "images/wolf3-run-left.png",
        "images/rect.png",
        "images/surprise.png",
        "images/question.png",
        "images/rock0.png",
        "images/rock1.png",
        "images/rock2.png",
        "images/paper.png",
        "images/carrot.png",
        "images/black.png",
        "images/select.png",
        "images/faint-death.png",
        "images/fainting-death.png",
        "images/reward-screen.png",
        "images/flower.png",
        "images/rabbit-run-left.png",
        "images/rabbit-run-right.png",
        "images/rabbit-sprint-left.png",
        "images/rabbit-sprint-right.png",
        "images/gameover.png",
        "images/tuto1.png",
        "images/tuto2.png",
        "images/tuto3.png",
        "images/tuto4.png",
        "images/dead.png"
    )

    jaws.start(HelpState)

    // quickfix
    document.getElementById("canvas").setAttribute("width", "1024");
    document.getElementById("canvas").setAttribute("height", "768");
}
