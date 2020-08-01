let rangeBrightness = document.querySelector('#brightness');
let labelBrightness = document.querySelector('#brightnessValue');

let rangeContrast = document.querySelector('#contrast');
let labelContrast = document.querySelector('#contrastValue');

let bright = 0;
let contrast = 0;
let saturation = 0;

rangeBrightness.value = bright;
rangeContrast.value = contrast;

labelBrightness.innerHTML = `Brightness: ${bright}`;
labelContrast.innerHTML = `Contrast: ${contrast}`;

Caman("#preprocss", function () {
    this.brightness(bright);
    this.contrast(contrast);
    this.render();
});

rangeBrightness.addEventListener('input', function () {
    bright = rangeBrightness.value;
    labelBrightness.innerHTML = `Brightness: ${bright}`

    Caman("#preprocss", function () {
        this.brightness(bright).render();
    });
}, false);

rangeContrast.addEventListener('input', function () {
    contrast = rangeContrast.value;
    labelContrast.innerHTML = `Contrast: ${contrast}`

    Caman("#preprocss", function () {
        this.contrast(contrast).render();
    });
}, false);
