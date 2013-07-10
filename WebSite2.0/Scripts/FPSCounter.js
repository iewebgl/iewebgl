function FPSCounter() {
    var counterID;
    var intervalID;

    (function () {
        this.check = true;
    })();

    return {
        'createElement': function (elem) {
            counterID = elem.id;
            this.fps = 0;
        },
        'increment': function () {
            ++this.fps;
        },
        'clear': function () {
            this.fps = 0;
        },
        'UpdateFPS': function () {
            var fpsDiv = document.getElementById(counterID);
            fpsDiv.innerHTML = this.fps + " FPS";
            this.fps = 0;
        },
        'run': function () {
            var that = this;
            intervalID = setInterval(function () { that.UpdateFPS.call(that); }, 1000);
        },
        'stop': function () {
            clearInterval(intervalID);
            this.fps = 0;
            this.UpdateFPS();
        }
    }
}