transition = null;
transitionEnd = null;
middleTransitionCallback = null;

initTransition = function () {
    black = new jaws.Sprite({"image": "images/black.png"});
    white = new jaws.Sprite({"image": "images/white.png"});
    transition = black;
}

startTransition = function (callback) {
    middleTransitionCallback = callback;
    transition = black;
    transitionEnd = Date.now() + 2000;
}

startWhiteTransition = function (callback) {
    middleTransitionCallback = callback;
    transition = white;
    transitionEnd = Date.now() + 2000;
}

transitionDraw = function () {
    if (transitionEnd) {
        let startedAt = transitionEnd - 2000;
        let timeRemaining = transitionEnd - Date.now();

        if (timeRemaining < 1000) {
            if (middleTransitionCallback) {
                middleTransitionCallback();
                middleTransitionCallback = null;
            }

            transition.alpha = timeRemaining / 1000;
        } else {
            transition.alpha = 1 - ((timeRemaining - 1000) / 1000);
        }

        if (timeRemaining < 0) {
            console.log('fini');
            transitionEnd = null;
        } else {
            transition.draw();
        }

    }
}
