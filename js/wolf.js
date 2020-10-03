Wolf = {
    create(x, y, rabbit, obstacles) {
        let status = 'reaching_for_target';
        let speed = 0.30;
        let snifRadius = 500;
        let giveUpDistance = 300;
        let snifAngleOpening = Math.PI / 2;
        let reactionTime = 1000;
        let reactionEndPlanned = null;
        let chaseSpeedMultiplier = 2;
        let previousStatusBeforeChase = status;
        let backToNormalPlanned = null;

        let originalPosition = {x, y};
        let wolfAnimation = new jaws.Animation({
            sprite_sheet: "images/wolf.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        let surpriseAnimation = null;
        let questionAnimation = null;
        let surpriseSprite = jaws.Sprite({x, y});

        let wolf = new jaws.Sprite({x, y});
        wolf.currentAnimation = wolfAnimation;
        let target = new jaws.Sprite({
            //x: getRandomInt(WIDTH),
            //y: getRandomInt(HEIGHT),
            x: 1000,
            y: 400,
            image: "images/rect.png",
        });
        wolf.target = target;
        wolf.hitRabbit = false;
        wolf.rabbit = rabbit;

        let originalDraw = wolf.draw;

        wolf.draw = function() {
            originalDraw.apply(this);
            //wolf.target.draw();

            if (status === 'detecting_rabbit') {
                surpriseSprite.x = wolf.x;
                surpriseSprite.y = wolf.y - 24;
                surpriseSprite.setImage(surpriseAnimation.next());
                surpriseSprite.draw();
            }

            if (status === 'giving_up_chase') {
                surpriseSprite.x = wolf.x;
                surpriseSprite.y = wolf.y - 24;
                surpriseSprite.setImage(questionAnimation.next());
                surpriseSprite.draw();
            }
        }

        wolf.update = function() {
            if (status === 'detecting_rabbit') {
                if (Date.now() >= reactionEndPlanned) {
                    status = 'chasing_rabbit';
                } else {
                    return;
                }
            }

            if (status === 'giving_up_chase') {
                if (Date.now() >= backToNormalPlanned) {
                    status = previousStatusBeforeChase;
                } else {
                    return;
                }
            }

            let currentTarget;

            if (status === 'reaching_for_target') {
                currentTarget = target;
            } else if (status === 'reaching_for_original_position') {
                currentTarget = originalPosition;
            } else if (status === 'chasing_rabbit') {
                currentTarget = rabbit;
            }

            if (status === 'reaching_for_original_position'
                || status === 'reaching_for_target'
            ) {
                if (getDistance(rabbit, wolf) <= snifRadius) {
                    let angle = getAngle(wolf, currentTarget);
                    let snifAngle = getAngle(wolf, rabbit);

                    if (snifAngle >= angle - snifAngleOpening / 2
                        && snifAngle <= angle + snifAngleOpening / 2
                    ) {
                        let canSeeRabbit = true;
                        let sightLine = {
                            a: {x: wolf.x + wolf.width / 2, y: wolf.y + wolf.height / 2},
                            b: {x: rabbit.x + rabbit.width / 2, y: rabbit.y + rabbit.height / 2},
                        };

                        for (var i = 0; i < obstacles.length; ++i) {
                            let obstacle = obstacles.sprites[i];

                            let diagonalA = {
                                a: {x: obstacle.x, y: obstacle.y},
                                b: {x: obstacle.x + obstacle.width, y: obstacle.y + obstacle.height}
                            };

                            let diagonalB = {
                                a: {x: obstacle.x + obstacle.width, y: obstacle.y},
                                b: {x: obstacle.x, y: obstacle.y + obstacle.height}
                            };

                            if (doLinesIntersect(sightLine, diagonalA)
                                || doLinesIntersect(sightLine, diagonalB)
                            ) {
                                canSeeRabbit = false;
                                break;
                            }
                        }

                        if (canSeeRabbit) {
                            previousStatusBeforeChase = status;
                            status = 'detecting_rabbit';
                            reactionEndPlanned = Date.now() + reactionTime;

                            surpriseAnimation = new jaws.Animation({
                                sprite_sheet: "images/surprise.png",
                                frame_size: [32, 32],
                                frame_duration: reactionTime / 3,
                            });
                        }
                    }
                }
            }

            let distance = getDistance(currentTarget, wolf);

            if (status === 'chasing_rabbit' && distance >= giveUpDistance) {
                status = 'giving_up_chase';
                backToNormalPlanned = Date.now() + reactionTime;
                questionAnimation = new jaws.Animation({
                    sprite_sheet: "images/question.png",
                    frame_size: [32, 32],
                    frame_duration: reactionTime / 3,
                });

                return;
            }

            if (distance <= 1) {
                if (status === 'reaching_for_target') {
                    status = 'reaching_for_original_position';
                } else if (status === 'reaching_for_original_position') {
                    status = 'reaching_for_target';
                }
            } else {
                let angle = getAngle(wolf, currentTarget);
                let actualSpeed = speed;

                if (status === 'chasing_rabbit') {
                    actualSpeed *= chaseSpeedMultiplier;
                }

                //wolf.x += Math.sin(angle) * actualSpeed;
                //wolf.y += Math.cos(angle) * actualSpeed;
            }
        }

        return wolf;
    }
};
