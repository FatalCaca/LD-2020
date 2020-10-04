Obstacle = {
    create(x, y, wantedImage) {
        let images = [
            "images/rock0.png",
            "images/rock1.png",
            "images/rock2.png",
        ];

        let image = images[getRandomInt(images.length - 1)];

        console.log(wantedImage);

        if (wantedImage) {
            image = wantedImage;
        }

        let obstacle = jaws.Sprite({x, y, image});
        let hitbox = jaws.Sprite({x: x, y: y + 16});
        hitbox.width = 32;
        hitbox.height = 16;
        obstacle.hitbox = hitbox;
        obstacle.width = 32;
        obstacle.height = 32;

        let collisionDiagonals = [
            {
                a: {x, y: y + 16},
                b: {x: x + hitbox.width, y: y + 16 + hitbox.height}
            },
            {
                a: {x: x + hitbox.width, y: y + 16},
                b: {x, y: y + 16 + hitbox.height}
            },
        ];

        hitbox.collidesWith = function (thing) {
            let thingRect = [
                {
                    a: {x: thing.x, y: thing.y},
                    b: {x: thing.x + thing.width, y: thing.y},
                },
                {
                    a: {x: thing.x + thing.width, y: thing.y},
                    b: {x: thing.x + thing.width, y: thing.y + thing.height},
                },
                {
                    a: {x: thing.x + thing.width, y: thing.y + thing.height},
                    b: {x: thing.x, y: thing.y + thing.height},
                },
                {
                    a: {x: thing.x, y: thing.y + thing.height},
                    b: {x: thing.x, y: thing.y},
                }
            ];

            for (var j = 0; j < collisionDiagonals.length; ++j) {
                for (var i = 0; i < thingRect.length; ++i) {
                    if (doLinesIntersect(
                            thingRect[i],
                            collisionDiagonals[j]
                    )) {
                        console.log('hit 2');
                        return true;
                    }
                }
            }

            return false;
        }

        return obstacle;
    }
}
