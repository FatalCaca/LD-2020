const WIDTH = 1024;
const HEIGHT = 768;

const RABBIT_MAX_MOMENTUM = 2;
const RABBIT_ACCELERATION = 0.1;
const RABBIT_SPEED_DECAY = 0.9;

function PlayState() {
    let level = 3;
    let bg;
    let rabbit;
    let wolves;
    let obstacles;
    let quadtree = new jaws.QuadTree();

    this.setup = function () {
        bg = new jaws.Sprite({"image": "images/grass.png"});
        rabbit = Rabbit.create();
        wolves = new jaws.SpriteList();
        obstacles = new jaws.SpriteList();

        for (var i = 0; i < 20; ++i) {
            obstacles.push(Obstacle.create(
                getRandomInt(WIDTH / 32) * 32,
                getRandomInt(HEIGHT / 32) * 32
            ));
        }

        for (var i = 0; i < level; ++i) {
            wolves.push(Wolf.create(i * 150, 400, rabbit, obstacles));
        }


        obstaclesHitBoxes = obstacles.map((o) => o.hitbox);
    }

    this.update = function () {
        rabbit.hitList = [];

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
            rabbit.die();
        });
    }

    this.draw = function () {
        jaws.clear();
        let thingsToDraw = [
            bg,
            rabbit,
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
    }

    function isOutsideCanvas(item) {
        return (item.x < 0 || item.y < 0 || item.x > canvas.width || item.y > canvas.height);
    }
}

window.onload = function() {
    jaws.assets.add(
        "images/grass.png",
        "images/rabbit.png",
        "images/wolf.png",
        "images/rect.png",
        "images/surprise.png",
        "images/question.png",
        "images/rock0.png",
        "images/rock1.png",
        "images/rock2.png",
        "images/dead.png"
    )

    jaws.start(PlayState)

    // quickfix
    document.getElementById("canvas").setAttribute("width", "1024");
    document.getElementById("canvas").setAttribute("height", "768");
}
