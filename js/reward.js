function RewardState() {
    let thingsToShow = [];
    let bg;
    let select;
    let selected = 0;
    let costs = [5, 15, 99999];
    let done = false;
    let carrot;
    let texts = [
        [
            "Faint death!",
            "",
            "Patroling wolves ignore you if not moving.",
            "Can fool a chasing wolf. Sometime.",
            "E to activate. Any movement ends it. Once per run.",
            "",
            perks[0] ? "Aquired !" : "Costs 5 carrots",
        ],
        [
            "Sprint!",
            "",
            "Get faster for a short duration",
            "Also bounce further",
            "Space to activate. Once per run",
            "",
            perks[1] ? "Aquired !" : "Costs 15 carrots",
        ],
        [
            "Shotgun!",
            "",
            "Shoot wolves and other things",
            "Might not be very suitable for a rabbit",
            "Very expensive",
            "",
            "Costs 99999 carrots",
        ],
    ];

    this.setup = function () {
        bg = jaws.Sprite({image: "images/reward-screen.png"});
        select = jaws.Sprite({image: "images/select.png"});
        carrot = Carrot.create(500, 25, 1.5);
    }

    this.update = function() {
        carrot.update();

        if (done) {
            return;
        }

        if (jaws.pressedWithoutRepeat("left q a")) {
            selected -= 1;

            if (selected <= -1) {
                selected = 2
            }
        }

        if (jaws.pressedWithoutRepeat("right d")) {
            selected += 1;

            if (selected >= 3) {
                selected = 0
            }
        }

        if (jaws.pressedWithoutRepeat("enter space")) {
            if (costs[selected] <= money && !perks[selected]) {
                done = true;
                perks[selected] += 1;
                money -= costs[selected];
                startWhiteTransition(() => jaws.switchGameState(PlayState));
            }
        }

        if (jaws.pressedWithoutRepeat("esc backspace")) {
            done = true;
            console.log('back to play');
            startWhiteTransition(() => jaws.switchGameState(PlayState));
        }
    }

    this.draw = function () {
        bg.draw();
        select.y = 100;
        select.x = 100 + 300 * selected;
        select.draw();

        jaws.context.font = "bold 40px consolas, ubuntu";
        jaws.context.lineWidth = 10;
        jaws.context.fillStyle =  "Black";
        jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
        jaws.context.fillText("You have " + money + " carrots", 80, 70);

        let text = texts[selected];
        jaws.context.font = "bold 24px consolas, ubuntu";

        for (var i = 0; i < text.length; ++i) {
            let line = text[i];
            jaws.context.fillText(line, 100, 550 + i * 35);
        }


        carrot.draw();

        transitionDraw();
    }
}
