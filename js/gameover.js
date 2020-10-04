function GameoverState() {
    let bg;
    let done = false;

    this.setup = function () {
        bg = jaws.Sprite({image: "images/gameover.png"});
    }

    this.update = function() {
        if (done) {
            return;
        }

        if (jaws.pressed("enter space esc")) {
            originalMap = null;
            money = 0;
            perks = [0, 0];
            startTransition(() => {
                jaws.switchGameState(PlayState);
                score = 0;
            });
            done = true;
        }
    }

    this.draw = function () {
        jaws.clear();
        bg.draw();

        jaws.context.font = "bold 40px consolas, ubuntu";
        jaws.context.lineWidth = 10;
        jaws.context.fillStyle =  "Black";
        jaws.context.strokeStyle = "rgba(150,150,150,0.0)";
        jaws.context.fillText("You scored " + score + " level(s) !", 280, 40);

        transitionDraw();
    }
}
