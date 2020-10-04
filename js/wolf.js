Wolf = {
    createWolf1(x, y, rabbit, obstacles, tileMap) {
        let wolf = Wolf.create(x, y, rabbit, obstacles, tileMap, 1);
        return wolf;
    },
    createWolf2(x, y, rabbit, obstacles, tileMap) {
        let wolf = Wolf.create(x, y, rabbit, obstacles, tileMap, 2);
        wolf.faintDeathSuccess = 60;
        wolf.chaseSpeedMultiplier = 1.6;
        wolf.speed = 0.50;
        wolf.snifRadius = 350;
        wolf.giveUpDistance = 400;
        wolf.snifAngleOpening = Math.PI / 1.5;
        wolf.reactionTime = 300;
        wolf.perseveranceTimeWithNoView = 1000;
        return wolf;
    },
    createWolf3(x, y, rabbit, obstacles, tileMap) {
        let wolf = Wolf.create(x, y, rabbit, obstacles, tileMap, 3);
        wolf.faintDeathSuccess = 30;
        wolf.chaseSpeedMultiplier = 1.7;
        wolf.speed = 0.50;
        wolf.snifRadius = 450;
        wolf.giveUpDistance = 600;
        wolf.snifAngleOpening = Math.PI;
        wolf.reactionTime = 150;
        wolf.perseveranceTimeWithNoView = 2000;
        return wolf;
    },
    create(x, y, rabbit, obstacles, tileMap, difficulty) {
        let status = 'reaching_for_patrol';
        let reactionEndPlanned = null;
        let previousStatusBeforeChase = status;
        let backToNormalPlanned = null;
        let giveUpNoViewPlanned = null;
        let detailedPath = null;
        let currentTarget = null;
        let updateItineraryTick = 0;
        let updateItineraryPeriod = 40;

        let originalPosition = {x, y};
        let surpriseAnimation = null;
        let questionAnimation = null;
        let surpriseSprite = jaws.Sprite({x, y});

        let wolf = new jaws.Sprite({x, y});
        wolf.difficulty = difficulty;
        wolf.faintDeathSuccess = 90;
        wolf.perseveranceTimeWithNoView = 1000;
        wolf.tileMap = tileMap;
        wolf.chaseSpeedMultiplier = 1.5;
        wolf.speed = 0.40;
        wolf.snifRadius = 250;
        wolf.giveUpDistance = 300;
        wolf.snifAngleOpening = Math.PI / 2;
        wolf.reactionTime = 500;
        let patrolPoint = new jaws.Sprite({
            x: getRandomInt(WIDTH),
            y: getRandomInt(HEIGHT),
            image: "images/dead.png",
        });

        let wolfWalkLeftAnimation = new jaws.Animation({
            sprite_sheet: "images/wolf" + difficulty + "-walk-left.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        wolf.currentAnimation = wolfWalkLeftAnimation;

        let wolfWalkRightAnimation = new jaws.Animation({
            sprite_sheet: "images/wolf" + difficulty + "-walk-right.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        let wolfRunLeftAnimation = new jaws.Animation({
            sprite_sheet: "images/wolf" + difficulty + "-run-left.png",
            frame_size: [32, 32],
            frame_duration: 250,
        });

        let wolfRunRightAnimation = new jaws.Animation({
            sprite_sheet: "images/wolf" + difficulty + "-run-right.png",
            frame_size: [32, 32],
            frame_duration: 250,
        });

        setStatus(status);
        wolf.patrolPoint = patrolPoint;
        wolf.hitRabbit = false;
        wolf.rabbit = rabbit;

        let originalDraw = wolf.draw;

        wolf.getStatus = function () {
            return status;
        }

        wolf.draw = function() {
            let targetDirection = (currentTarget && currentTarget.x < wolf.x)
                ? 'left'
                : 'right'
            ;

            if (status === 'chasing_rabbit' || status === 'giving_up_chase') {
                if (targetDirection == 'left') {
                    wolf.setImage(wolfRunLeftAnimation.next());
                } else {
                    wolf.setImage(wolfRunRightAnimation.next());
                }
            }

            if (status === 'reaching_for_patrol' || status === 'reaching_for_original_position') {
                if (targetDirection == 'left') {
                    wolf.setImage(wolfWalkLeftAnimation.next());
                } else {
                    wolf.setImage(wolfWalkRightAnimation.next());
                }
            }

            originalDraw.apply(this);

            if (debug) {
                wolf.patrolPoint.draw();
            }

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

            if (debug) {
                if (detailedPath) {
                    for (var i = 0; i < detailedPath.length; ++i) {
                        let e = detailedPath[i];
                        let s = jaws.Sprite({x: e.x, y: e.y, image: "images/rect.png"});
                        s.draw();
                    }
                }
            }
        }

        function setStatus (newStatus) {
            status = newStatus;

            if (status === 'reaching_for_patrol') {
                currentTarget = patrolPoint;
            } else if (status === 'reaching_for_original_position') {
                currentTarget = originalPosition;
            } else if (status === 'chasing_rabbit') {
                currentTarget = rabbit;
            }

            updateItinerary();
        }

        wolf.setStatus = setStatus;

        function getCurrentTarget () {
            return currentTarget;
        }

        function updateItinerary () {
            detailedPath = null;

            if (!canSeeThing(currentTarget)) {
                let start = [wolf.x, wolf.y];
                let end = [currentTarget.x, currentTarget.y];
                detailedPath = wolf.tileMap.findPath(start, end);
                detailedPath.shift();
                detailedPath.shift();
            }
        }

        wolf.updateItinerary = updateItinerary;

        wolf.update = function() {
            updateItineraryTick += 1;

            if (status === 'detecting_rabbit') {
                if (Date.now() >= reactionEndPlanned) {
                    setStatus('chasing_rabbit');
                } else {
                    return;
                }
            }

            if (status === 'giving_up_chase') {
                if (Date.now() >= backToNormalPlanned) {
                    setStatus(previousStatusBeforeChase);
                } else {
                    return;
                }
            }

            let currentTarget = getCurrentTarget();

            if (rabbit.status === 'alive') {
                if (status === 'reaching_for_original_position'
                        || status === 'reaching_for_patrol'
                   ) {
                    if (getDistance(rabbit, wolf) <= wolf.snifRadius) {
                        let angle = getAngle(wolf, currentTarget);
                        let snifAngle = getAngle(wolf, rabbit);

                        if (snifAngle >= angle - wolf.snifAngleOpening / 2
                                && snifAngle <= angle + wolf.snifAngleOpening / 2
                                && canSeeThing(rabbit)
                           ) {
                            previousStatusBeforeChase = status;
                            setStatus('detecting_rabbit');
                            reactionEndPlanned = Date.now() + wolf.reactionTime;

                            surpriseAnimation = new jaws.Animation({
                                sprite_sheet: "images/surprise.png",
                                frame_size: [32, 32],
                                frame_duration: wolf.reactionTime / 3,
                            });
                        }
                    }
                }
            }

            let distance = getDistance(currentTarget, wolf);

            if (status === 'chasing_rabbit') {
                if (canSeeThing(rabbit) && giveUpNoViewPlanned) {
                    giveUpNoViewPlanned = null;
                } else {
                    if (!giveUpNoViewPlanned) {
                        giveUpNoViewPlanned = Date.now() + wolf.perseveranceTimeWithNoView;
                    }

                    if (updateItineraryTick % updateItineraryPeriod == 0) {
                        updateItinerary();
                    }
                }


                if (distance >= wolf.giveUpDistance
                    || (giveUpNoViewPlanned && Date.now() >= giveUpNoViewPlanned)
                ) {
                    giveUpChase();

                    return;
                }
            }

            if (distance <= 1) {
                if (status === 'reaching_for_patrol') {
                    setStatus('reaching_for_original_position');
                } else if (status === 'reaching_for_original_position') {
                    setStatus('reaching_for_patrol');
                }
            } else {
                let intermediaryTarget = currentTarget;

                if (detailedPath && detailedPath.length) {
                    intermediaryTarget = detailedPath[0];

                    if (getDistance(intermediaryTarget, wolf) <= 1) {
                        detailedPath.shift();
                    }

                    intermediaryTarget = detailedPath[0];

                    if (!intermediaryTarget ) {
                        intermediaryTarget = currentTarget;
                    }
                }

                let angle = getAngle(wolf, intermediaryTarget);
                let actualSpeed = wolf.speed;

                if (status === 'chasing_rabbit') {
                    actualSpeed *= wolf.chaseSpeedMultiplier;
                }

                wolf.x += Math.sin(angle) * actualSpeed;
                wolf.y += Math.cos(angle) * actualSpeed;
            }
        }

        // todo: optimize obstacle pre selection
        function canSeeThing(thing) {
            if (!thing.width) {
                thing.width = 1;
            }

            if (!thing.height) {
                thing.height = 1;
            }

            let sightLine = {
                a: {x: wolf.x + wolf.width / 2, y: wolf.y + wolf.height / 2},
                b: {x: thing.x + thing.width / 2, y: thing.y + thing.height / 2},
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
                    return false;
                }
            }

            return true;
        }

        function giveUpChase () {
            setStatus('giving_up_chase');
            backToNormalPlanned = Date.now() + wolf.reactionTime * 3;

            questionAnimation = new jaws.Animation({
                sprite_sheet: "images/question.png",
                frame_size: [32, 32],
                frame_duration: wolf.reactionTime,
            });
        }

        wolf.giveUpChase = giveUpChase;

        return wolf;
    }};
