function handleControls(rabbit) {
    if (rabbit.hitList && rabbit.hitList.length) {
        console.log('bing');
        rabbit.x -= rabbit.momentum[0];
        rabbit.y -= rabbit.momentum[1];

        for (var i = 0; i < rabbit.hitList.length; ++i) {
            let hitThing = rabbit.hitList[i];
            rabbit.x += rabbit.momentum[0];

            if (hitThing.collidesWith(rabbit)) {
                rabbit.x -= rabbit.momentum[0];
                rabbit.momentum[0] = -rabbit.momentum[0] * 0.5;
            }

            rabbit.y += rabbit.momentum[1];

            if (hitThing.collidesWith(rabbit)) {
                rabbit.y -= rabbit.momentum[1];
                rabbit.momentum[1] = -rabbit.momentum[1] * 0.5;
            }
        }
    }

    if (jaws.pressed("left a q")) {
        rabbit.momentum[0] -= 0.01;
    }

    if (jaws.pressed("right d")) {
        rabbit.momentum[0] += 0.01;
    }

    if (!jaws.pressed("left a q right d")) {
        rabbit.momentum[0] *= RABBIT_SPEED_DECAY;

        if (rabbit.momentum[0] <= 0.005) {
            rabbit.momentum[0] = 0;
        }
    }

    if (rabbit.momentum[0] > RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[0] = RABBIT_MAX_MOMENTUM;
    }

    if (rabbit.momentum[0] < -RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[0] = -RABBIT_MAX_MOMENTUM;
    }

    if (jaws.pressed("up z w")) {
        rabbit.momentum[1] -= 0.01;
    }

    if (jaws.pressed("down s")) {
        rabbit.momentum[1] += 0.01;
    }

    if (!jaws.pressed("up z w down s")) {
        rabbit.momentum[1] *= RABBIT_SPEED_DECAY;

        if (rabbit.momentum[1] <= 0.005) {
            rabbit.momentum[1] = 0;
        }
    }

    if (rabbit.momentum[1] > RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[1] = RABBIT_MAX_MOMENTUM;
    }

    if (rabbit.momentum[1] < -RABBIT_MAX_MOMENTUM) {
        rabbit.momentum[1] = -RABBIT_MAX_MOMENTUM;
    }

    rabbit.x += rabbit.momentum[0];
    rabbit.y += rabbit.momentum[1];
}
