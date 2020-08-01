let rangeBrightness = document.querySelector('#brightness');
let labelBrightness = document.querySelector('#brightnessVelue');
let bright = 0;

rangeBrightness.value = bright;
labelBrightness.innerHTML = bright;

Caman("#preprocss", function () {
    this.brightness(bright);
    this.render();
});

rangeBrightness.addEventListener('input', function () {
    //console.log(rangeBrightness.value)
    bright = rangeBrightness.value;
    labelBrightness.innerHTML = bright

    console.log(bright);

    Caman("#preprocss", function () {
        this.brightness(bright).render();
    });
}, false);
