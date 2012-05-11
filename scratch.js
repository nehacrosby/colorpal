function scratchPad() {
// Fill the background with white then draw an image on top.
// Green is rgb(0, 127, 0) which we cannot get by mixing:
// Blue: (0, 0, 255) + Yellow: (255, 255, 0)
var firstColor = $.xcolor.test("yellow");
console.log(firstColor);
var secondColor = $.xcolor.test("blue");
console.log(secondColor);
// Rectangle 1
ctx.fillStyle = firstColor.getCSS();
ctx.fillRect(0, 0, 100, 100);

// Rectangle 2
ctx.fillStyle = secondColor.getCSS();
ctx.fillRect(200, 0, 100, 100);

// Get CMYK:
var firstCMYK = RGBtoCMYK(firstColor.getRGB().r, firstColor.getRGB().g, firstColor.getRGB().b);
console.log(firstCMYK);

var secondCMYK = RGBtoCMYK(secondColor.getRGB().r, secondColor.getRGB().g, secondColor.getRGB().b);
console.log(secondCMYK);

var mixedCMYK = [(firstCMYK[0] + secondCMYK[0])/2,
(firstCMYK[1] + secondCMYK[1])/2,
(firstCMYK[2] + secondCMYK[2])/2,
(firstCMYK[3] + secondCMYK[3])/2
];

console.log(mixedCMYK);
console.log(CMYKtoRGB(mixedCMYK[0], mixedCMYK[1], mixedCMYK[2], mixedCMYK[3]));
//var secondColorHsla = secondColor.hsla();
//var mixedColor = mixHslaColors(firstColorHsla, secondColorHsla)
//  console.log(mixedColor.getName());
//ctx.fillStyle = mixedColor.toRgbaString();
//ctx.fillRect(100, 200, 100, 100);
}