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
            return x + hitbox.width >= thing.x && x < thing.x + thing.width
                && y + 16 + hitbox.height >= thing.y && y + 16 < thing.y + thing.height
            ;
        }

        return obstacle;
    }
}
