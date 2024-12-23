function convertToScrubber(input) {
    var i0 = 0;
    var i2 = 0;
    var x0 = 0;
    var step = 1;
    var style = document.createElement("style");

    function nonNaN(n, d) {
        var m = Number(n);
        if (isNaN(m)) {
            m = d || 0;
        }
        return m;
    }

    function onMouseUp(e) {
        style.remove();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchmove", onMouseMove);
        window.removeEventListener("touchend", onMouseUp);
    }

    function onMouseMove(e) {
        var ex = 0;
        if (e.touches) {
            if (e.type != "touchstart") {
                e.preventDefault();
            }
            ex = e.touches[0].clientX;
        }
        else {
            ex = e.clientX;
        }
        var x1 = ex;
        var dx = (x1 - x0);
        var i1 = i0 + dx * step;
        if ("jsscrub" in input.dataset) {
            if (input.dataset.jsscrub.includes("integer")) {
                i1 = Math.round(i1);
            }
            if (input.dataset.jsscrub.includes("continuous")) {
                var min = nonNaN(input.min, 0);
                var max = nonNaN(input.max, 100);
                var dm = max - min;
                i1 = ((i1 - min) % dm + dm) % dm + min;
            }
        }
        if (input.min) {
            i1 = Math.max(i1, input.min);
        }
        if (input.max) {
            i1 = Math.min(i1, input.max);
        }
        if (i1 != i2) {
            input.value = i1;
            input.dispatchEvent(new InputEvent("change"));
        }
        i2 = i1;
    }

    function onMouseDown(e) {
        var ex = 0;
        if (e.touches) {
            ex = e.touches[0].clientX;
        }
        else {
            ex = e.clientX;
        }
        i0 = nonNaN(input.value);
        i2 = i0;
        x0 = ex;
        onMouseMove(e);
        document.body.appendChild(style);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove, {"passive": false});
        window.addEventListener("touchend", onMouseUp);
    }

    if (input.step) {
        step = nonNaN(input.step, 1);
        if (input.dataset.jsscrub.includes("integer")) {
            input.step = Math.max(1, parseInt(step));
        }
    }

    input.style.cursor = "ew-resize";
    style.innerHTML = "html {cursor: ew-resize;} body {pointer-events: none;}";

    input.addEventListener("mousedown", onMouseDown);
    input.addEventListener("touchstart", onMouseDown);
}

function initScrubbers() {
    var scrubbers = document.getElementsByClassName("jsscrub");
    for (var i = 0; i < scrubbers.length; i++) {
        if (scrubbers[i].tagName == "INPUT" && scrubbers[i].type == "number") {
            convertToScrubber(scrubbers[i]);
        }
    }
}

window.addEventListener("load", initScrubbers);