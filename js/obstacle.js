Obstacle = {
    create(x, y) {
        let images = [
            "images/rock0.png",
            "images/rock1.png",
            "images/rock2.png",
        ];

        let image = images[getRandomInt(images.length - 1)];
        let obstacle = jaws.Sprite({x, y, image});
        let hitbox = jaws.Sprite({x: x, y: y + 16});
        hitbox.width = 32;
        hitbox.height = 16;
        obstacle.hitbox = hitbox;
        obstacle.width = 32;
        obstacle.height = 32;

        hitbox.collidesWith = function (thing) {
            let thisSquare = {
                a: {x: x, y: y + 16},
                b: {x: x + hitbox.width, y: y + 16 + hitbox.height}
            };

            return (isPointInSquare(thing, thisSquare)
                || isPointInSquare({x: thing.x + thing.width, y: thing.y}, thisSquare)
                || isPointInSquare({x: thing.x, y: thing.y + thing.height}, thisSquare)
                || isPointInSquare({x: thing.x + thing.width, y: thing.y + thing.height}, thisSquare)
                || isPointInSquare({x: thing.x + thing.width / 2, y: thing.y + thing.height / 2}, thisSquare)
                );
        }

        return obstacle;
    }
}
