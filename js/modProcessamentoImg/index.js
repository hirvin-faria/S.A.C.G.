let rangeBrightness = document.querySelector('#brightness');
let labelBrightness = document.querySelector('#brightnessValue');

let rangeContrast = document.querySelector('#contrast');
let labelContrast = document.querySelector('#contrastValue');

let rangeSaturation = document.querySelector('#saturation');
let labelSaturation = document.querySelector('#saturationValue');

let bright = 0;
let contrast = 0;
let saturation = 0;

rangeBrightness.value = bright;
rangeContrast.value = contrast;
rangeSaturation.value = saturation;

labelBrightness.innerHTML = `Brightness: ${bright}`;
labelContrast.innerHTML = `Contrast: ${contrast}`;
labelSaturation.innerHTML = `Saturation: ${saturation}`;

Caman("#preprocss", function () {
    this.brightness(bright);
    this.contrast(contrast);
    this.saturation(saturation);
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


rangeSaturation.addEventListener('input', function () {
    saturation = rangeSaturation.value;
    labelSaturation.innerHTML = `Saturation: ${saturation}`

    Caman("#preprocss", function () {
        this.saturation(saturation).render();
    });
}, false);