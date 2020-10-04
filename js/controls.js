function handleControls(rabbit) {
    if (rabbit.hitList && rabbit.hitList.length) {
        console.log('bing');
        rabbit.incrementX(-rabbit.momentum[0]);
        rabbit.incrementY(-rabbit.momentum[1]);

        for (var i = 0; i < rabbit.hitList.length; ++i) {
            let hitThing = rabbit.hitList[i];
            rabbit.incrementX(rabbit.momentum[0]);

            if (hitThing.collidesWith(rabbit.obstacleHitbox)) {
                rabbit.incrementX(-rabbit.momentum[0]);
                rabbit.momentum[0] = -rabbit.momentum[0] * 0.5;
            }

            rabbit.incrementY(rabbit.momentum[1]);

            if (hitThing.collidesWith(rabbit.obstacleHitbox)) {
                rabbit.incrementY(-rabbit.momentum[1]);
                rabbit.momentum[1] = -rabbit.momentum[1] * 0.5;
            }
        }
    }

    if (rabbit.status !== 'fainting-death' && rabbit.status !== 'dead') {
        if (jaws.pressed("left a q")) {
            if (rabbit.sprinting) {
                rabbit.currentAnimation = rabbit.sprintLeftAnimation;
            } else {
                rabbit.currentAnimation = rabbit.runLeftAnimation;
            }

            rabbit.momentum[0] -= RABBIT_ACCELERATION;
        }

        if (jaws.pressed("right d")) {
            if (rabbit.sprinting) {
                rabbit.currentAnimation = rabbit.sprintRightAnimation;
            } else {
                rabbit.currentAnimation = rabbit.runRightAnimation;
            }

            rabbit.momentum[0] += RABBIT_ACCELERATION;
        }

        if (!jaws.pressed("left a q right d")) {
            rabbit.momentum[0] *= RABBIT_SPEED_DECAY;

            if (Math.abs(rabbit.momentum[0]) <= 0.005) {
                rabbit.momentum[0] = 0;
            }
        }

        if (jaws.pressed("up z w")) {
            rabbit.momentum[1] -= RABBIT_ACCELERATION;
        }

        if (jaws.pressed("down s")) {
            rabbit.momentum[1] += RABBIT_ACCELERATION;
        }

        if (!jaws.pressed("up z w down s")) {
            rabbit.momentum[1] *= RABBIT_SPEED_DECAY;

            if (Math.abs(rabbit.momentum[1]) <= 0.005) {
                rabbit.momentum[1] = 0;
            }
        }
    } else {
        rabbit.momentum[0] *= RABBIT_SPEED_DECAY;

        if (Math.abs(rabbit.momentum[0]) <= 0.005) {
            rabbit.momentum[0] = 0;
        }

        rabbit.momentum[1] *= RABBIT_SPEED_DECAY;

        if (Math.abs(rabbit.momentum[1]) <= 0.005) {
            rabbit.momentum[1] = 0;
        }
    }

    if (rabbit.momentum[0] > RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[0] = RABBIT_MAX_MOMENTUM;
    }

    if (rabbit.momentum[0] < -RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[0] = -RABBIT_MAX_MOMENTUM;
    }

    if (rabbit.momentum[1] > RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[1] = RABBIT_MAX_MOMENTUM;
    }

    if (rabbit.momentum[1] < -RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[1] = -RABBIT_MAX_MOMENTUM;
    }

    rabbit.incrementX(rabbit.momentum[0]);
    rabbit.incrementY(rabbit.momentum[1]);

    if (rabbit.x >= 1024 - 32) {
        rabbit.x = 1024 - 32;
    }

    if (rabbit.x < 0) {
        rabbit.x = 0;
    }

    if (rabbit.y >= 768 - 32) {
        rabbit.y = 768 - 32;
    }

    if (rabbit.y < 0) {
        rabbit.y = 0;
    }

    if (jaws.pressedWithoutRepeat("e") && (
        (canFaintDeath && perks[0])
        ||
        debug
    )) {
        rabbit.faintDeath();
    }

    if (jaws.pressedWithoutRepeat("space a") && (
        (canSprint && perks[1])
        ||
        debug
    )) {
        RABBIT_MAX_MOMENTUM = RABBIT_DEFAULT_MAX_MOMENTUM * 1.5;
        RABBIT_ACCELERATION = RABBIT_DEFAULT_ACCELERATION * 2;
        rabbit.sprinting = true;

        setTimeout(() => {
            RABBIT_MAX_MOMENTUM = RABBIT_DEFAULT_MAX_MOMENTUM;
            RABBIT_ACCELERATION = RABBIT_DEFAULT_ACCELERATION;
            rabbit.sprinting = false;
        }, 3000);
    }

    if (jaws.pressed("left a q right d space down s up z w")
            && rabbit.status === 'fainted-death'
    ) {
        rabbit.status = "alive";
    }
}
