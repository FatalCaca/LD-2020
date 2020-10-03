Wolf = {
    create(x, y, rabbit, obstacles, tileMap) {
        let status = 'reaching_for_patrol';
        let speed = 0.40;
        let snifRadius = 250;
        let giveUpDistance = 600;
        let snifAngleOpening = Math.PI / 2;
        let reactionTime = 300;
        let reactionEndPlanned = null;
        let chaseSpeedMultiplier = 2;
        let previousStatusBeforeChase = status;
        let backToNormalPlanned = null;
        let perseveranceTimeWithNoView = 100500;
        let giveUpNoViewPlanned = null;
        let detailedPath = null;
        let currentTarget = null;
        let updateItineraryTick = 0;
        let updateItineraryPeriod = 40;

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
        let patrolPoint = new jaws.Sprite({
            x: getRandomInt(WIDTH),
            y: getRandomInt(HEIGHT),
            image: "images/dead.png",
        });
        setStatus(status);
        wolf.patrolPoint = patrolPoint;
        wolf.hitRabbit = false;
        wolf.rabbit = rabbit;

        let originalDraw = wolf.draw;

        wolf.draw = function() {
            originalDraw.apply(this);
            wolf.patrolPoint.draw();

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

        function getCurrentTarget () {
            return currentTarget;
        }

        function updateItinerary () {
            detailedPath = null;

            if (!canSeeThing(currentTarget)) {
                let start = [wolf.x, wolf.y];
                let end = [currentTarget.x, currentTarget.y];
                detailedPath = tileMap.findPath(start, end);
                detailedPath.shift();
                detailedPath.shift();
            }
        }

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

            if (status === 'reaching_for_original_position'
                || status === 'reaching_for_patrol'
            ) {
                if (getDistance(rabbit, wolf) <= snifRadius) {
                    let angle = getAngle(wolf, currentTarget);
                    let snifAngle = getAngle(wolf, rabbit);

                    if (snifAngle >= angle - snifAngleOpening / 2
                        && snifAngle <= angle + snifAngleOpening / 2
                        && canSeeThing(rabbit)
                    ) {
                        previousStatusBeforeChase = status;
                        setStatus('detecting_rabbit');
                        reactionEndPlanned = Date.now() + reactionTime;

                        surpriseAnimation = new jaws.Animation({
                            sprite_sheet: "images/surprise.png",
                            frame_size: [32, 32],
                            frame_duration: reactionTime / 3,
                        });
                    }
                }
            }

            let distance = getDistance(currentTarget, wolf);

            if (status === 'chasing_rabbit') {
                if (canSeeThing(rabbit) && giveUpNoViewPlanned) {
                    giveUpNoViewPlanned = null;
                } else {
                    if (!giveUpNoViewPlanned) {
                        giveUpNoViewPlanned = Date.now() + perseveranceTimeWithNoView;
                    }

                    if (updateItineraryTick % updateItineraryPeriod == 0) {
                        updateItinerary();
                    }
                }


                if (distance >= giveUpDistance
                    || (giveUpNoViewPlanned && Date.now() >= giveUpNoViewPlanned)
                ) {
                    setStatus('giving_up_chase');
                    backToNormalPlanned = Date.now() + reactionTime * 3;

                    questionAnimation = new jaws.Animation({
                        sprite_sheet: "images/question.png",
                        frame_size: [32, 32],
                        frame_duration: reactionTime,
                    });

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
                let actualSpeed = speed;

                if (status === 'chasing_rabbit') {
                    actualSpeed *= chaseSpeedMultiplier;
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

        return wolf;
    }};
