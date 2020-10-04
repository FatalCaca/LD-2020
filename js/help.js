function HelpState() {
    let thingsToShow = [];
    let paper;
    let done = false;

    this.setup = function () {
        initTransition();

        thingsToShow = [
            jaws.Sprite({image: "images/tuto1.png"}),
            jaws.Sprite({image: "images/tuto2.png"}),
            jaws.Sprite({image: "images/tuto3.png"}),
            jaws.Sprite({image: "images/tuto4.png"}),
        ];

        paper = thingsToShow.shift();
    }

    this.update = function() {
        if (done) {
            return;
        }

        if (jaws.pressedWithoutRepeat("enter space")) {
            if (thingsToShow.length <= 0) {
                done = true;
                startTransition(() => jaws.switchGameState(PlayState));
            } else {
                paper = thingsToShow.shift();
            }
        }
    }

    this.draw = function () {
        jaws.clear();
        paper.draw();
        transitionDraw();
    }
}
