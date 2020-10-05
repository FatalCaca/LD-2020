Carrot = {
    create(x = 500, y = 500, scale = 1) {
        let carrot = new jaws.Sprite({x, y, scale});

        let animation = new jaws.Animation({
            sprite_sheet: "images/carrot.png",
            frame_size: [32, 32],
            frame_duration: 500,
        });

        carrot.update = function () { }

        let originalDraw = carrot.draw;

        carrot.draw = function () {
            carrot.setImage(animation.next());
            originalDraw.apply(this);
        }

        return carrot;
    }
}
