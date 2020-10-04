Rabbit = {
    create(x, y, wolves) {
        let rabbit = new jaws.Sprite({x: 0, y: 0});
        rabbit.status = "alive";
        rabbit.momentum = [0, 0];
        rabbit.width = 32;
        rabbit.height = 32;
        rabbit.wolves = wolves;

        rabbit.runRightAnimation = new jaws.Animation({
            sprite_sheet: "images/rabbit-run-right.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        rabbit.runLeftAnimation = new jaws.Animation({
            sprite_sheet: "images/rabbit-run-left.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        rabbit.sprintRightAnimation = new jaws.Animation({
            sprite_sheet: "images/rabbit-sprint-right.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        rabbit.sprintLeftAnimation = new jaws.Animation({
            sprite_sheet: "images/rabbit-sprint-left.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        rabbit.faintDeathAnimation = null;

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

        rabbit.currentAnimation = rabbit.runRightAnimation;

        rabbit.faintDeath = function() {
            rabbit.faintDeathAnimation = new jaws.Animation({
                sprite_sheet: "images/faint-death.png",
                frame_size: [32, 32],
                frame_duration: 200,
            });

            setTimeout(() => rabbit.status = "fainted-death", 200 * 3);
            rabbit.status = "fainting-death";

            if (!debug) {
                canFaintDeath = false;
            }

            rabbit.wolves.sprites.forEach((w) => {
                console.log(w.faintDeathSuccess);
                if (w.getStatus() === 'chasing_rabbit'
                    && getRandomInt(100) <= w.faintDeathSuccess
                ) {
                    w.giveUpChase();
                }
            });
        }

        rabbit.getSpeed = function() {
            return Math.sqrt(rabbit.momentum[0] * rabbit.momentum[0] + rabbit.momentum[1] * rabbit.momentum[1]);
        }

        rabbit.setX = function(newX) {
            rabbit.x = newX;
            rabbit.obstacleHitbox.x = rabbit.x + 4;
            rabbit.hitbox.x = rabbit.x + 15;
        }

        rabbit.setY = function(newY) {
            rabbit.y = newY;
            rabbit.obstacleHitbox.y = rabbit.y + 16;
            rabbit.hitbox.y = rabbit.y + 15;
        }

        rabbit.incrementX = function (increment) {
            rabbit.setX(rabbit.x + increment);
        }

        rabbit.incrementY = function (increment) {
            rabbit.setY(rabbit.y + increment);
        }

        rabbit.update = function () {
            if (rabbit.status === 'dead') {
                rabbit.currentAnimation = rabbit.deadAnimation;
            }

            rabbit.currentAnimation.frame_duration = 500 / (rabbit.getSpeed() * 4);
        }

        rabbit.die = function () {
            rabbit.status = 'dead';
        }

        let originalDraw = rabbit.draw;

        rabbit.draw = function() {
            if (rabbit.status === "alive" || rabbit.status === 'dead') {
                rabbit.setImage(rabbit.currentAnimation.next());
            }

            if (rabbit.status === "fainting-death") {
                rabbit.setImage(rabbit.faintDeathAnimation.next());
            }

            if (rabbit.status === "fainted-death") {
                rabbit.setImage("images/fainting-death.png");
            }

            originalDraw.apply(this);
        }

        return rabbit;
    }
}
