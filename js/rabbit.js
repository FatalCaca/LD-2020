Rabbit = {
    create(x, y) {
        let rabbit = new jaws.Sprite({x: 0, y: 0});
        rabbit.momentum = [0, 0];
        rabbit.width = 32;
        rabbit.height = 32;

        rabbit.runAnimation = new jaws.Animation({
            sprite_sheet: "images/rabbit.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        rabbit.deadAnimation = new jaws.Animation({
            sprite_sheet: "images/dead.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        rabbit.hitbox = new jaws.Sprite({x: 0, y: 0});
        rabbit.hitbox.width = 1;
        rabbit.hitbox.height = 1;

        rabbit.obstacleHitbox = new jaws.Sprite({x: 0, y: 0});
        rabbit.obstacleHitbox.width = 24;
        rabbit.obstacleHitbox.height = 16;

        rabbit.currentAnimation = rabbit.runAnimation;

        rabbit.getSpeed = function() {
            return Math.sqrt(rabbit.momentum[0] * rabbit.momentum[0] + rabbit.momentum[1] * rabbit.momentum[1]);
        }

        rabbit.update = function () {
            rabbit.hitbox.x = rabbit.x + 15;
            rabbit.hitbox.y = rabbit.y + 15;
            rabbit.obstacleHitbox.x = rabbit.x + 4;
            rabbit.obstacleHitbox.y = rabbit.y + 16;
            rabbit.currentAnimation = rabbit.runAnimation;
            rabbit.runAnimation.frame_duration = 500 / (rabbit.getSpeed() * 4);
        }

        rabbit.die = function () {
            rabbit.currentAnimation = rabbit.deadAnimation;
        }

        let originalDraw = rabbit.draw;

        rabbit.draw = function() {
            rabbit.setImage(rabbit.currentAnimation.next());
            originalDraw.apply(this);
        }

        return rabbit;
    }
}
