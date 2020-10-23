const canvas = document.getElementById('canvas');
const canvas2d = canvas.getContext('2d');
const preQuantization = document.getElementById('pre-quantization');



window.addEventListener('load', function () {
    document.querySelector('input[type="file"]').addEventListener('change', function () {
        if (this.files && this.files[0]) {
            var img = document.querySelector('img');  // $('img')[0]
            img.src = URL.createObjectURL(this.files[0]); // set src to blob url
            img.onload = main;
        }
    });
});

function main() {
    constructCanvas(this);
}

function constructCanvas(img) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas2d.drawImage(img, 0, 0);

}

preQuantization.addEventListener("click", function (event) { //esta função serve para inicializar a pre quantização, ou seja achar as cores que a imagem vai possuir
    event.preventDefault;
    const numberColors = 2; //numero de cores que a nossa imagem deve ter 2^8=256
    let pallet = getPallet(numberColors);
});


function getPallet(numberColors) {
    /*let initImage = canvas2d.getImageData(0, 0, canvas.width, canvas.height);
    let dataImage = initImage.data; // dados de cada pixel da imagem 
    let lengthImage = dataImage.length; //quantidade de pixel
    let pixelVetor = [];
    console.log("Dados da da Imegem");

    for (let i = 0; i < lengthImage; i += 4) {
        let groupPixel = [dataImage[i], dataImage[i + 1], dataImage[i + 2]];
        //console.log("R:[i]"+dataImage[i]+",   G:[i+1]"+ dataImage[i+1]+",   B: [i+2]:"+dataImage[i+2]);
        pixelVetor.push(groupPixel);
    }


    let colorString = [...new Set(pixelVetor.map(color => color.toString()))];
    let colorsArr = colorString.map(color => color.split(','));*/

    let colorsArr = [[136, 0, 21], [136, 0, 21], [255, 174, 200], [255, 174, 200],
    [255, 174, 200], [185, 122, 87], [185, 122, 87], [140, 255, 251],
    [239, 228, 176], [239, 228, 176], [200, 191, 231], [196, 255, 14],
    [255, 127, 39], [34, 177, 76], [195, 195, 195], [195, 195, 195]
    ];


    let sliceArrColors = [];

    medianCut(colorsArr, colorsArr, numberColors, sliceArrColors);

    pallet = getColors(sliceArrColors);
    console.log("Paleta de cores");
    console.log(pallet);
    for (let i = 0; i < pallet.length; i++) {
        console.log("Cor RGB:" + pallet[i]);
    }
}

function medianCut(colorsArr1, colorsArr2, numberColors, sliceArrColors) {
    if (numberColors === 1) {
        sliceArrColors.push(colorsArr1);
        return;
    } else {
        numberColors /= 2;
        //let greaterBreadth = getMaiorAmplitude(histogram);
        let greaterBreadth = getGreaterAmplitude(colorsArr1);
        //console.log(greaterBreadth);
        colorsArr1.sort(function (a, b) { return +a[greaterBreadth] - +b[greaterBreadth]; });
        let half = Math.floor(colorsArr1.length / 2);
        let firstHalf = colorsArr1.slice(0, half - 1);
        let secondHalf = colorsArr1.slice(half);
        medianCut(firstHalf, colorsArr1, numberColors, sliceArrColors);
        medianCut(secondHalf, colorsArr1, numberColors, sliceArrColors);
    }
}

function getColors(sliceArrColors) {
    let colorSet = [];

    sliceArrColors.forEach(element => {
        let r = 0;
        let g = 0;
        let b = 0;
        element.forEach(sumColor => {
            r += + sumColor[0];
            g += + sumColor[1];
            b += + sumColor[2];
        });
        let red = Math.floor(r / element.length);
        let green = Math.floor(g / element.length);
        let blue = Math.floor(b / element.length);

        let pallet = [red, green, blue];
        colorSet.push(pallet);
    });
    return colorSet;
}

function getGreaterAmplitude(colorsRGB) {
    let arrayR = [], arrayG = [], arrayB = [];
    arrayR = arrayChannelColor(colorsRGB, 0);
    arrayG = arrayChannelColor(colorsRGB, 1);
    arrayB = arrayChannelColor(colorsRGB, 2);

    let maxR, maxG, maxB;
    let minR, minG, minB;
    maxR = findMax(arrayR);
    maxG = findMax(arrayG);
    maxB = findMax(arrayB);

    minR = findMin(arrayR);
    minG = findMin(arrayG);
    minB = findMin(arrayB);

    let amplitudeR, amplitudeG, amplitudeB;
    amplitudeR = maxR - minR;
    amplitudeG = maxG - minG;
    amplitudeB = maxB - minB;

    let cutColor = [[amplitudeR, 0], [amplitudeG, 1], [amplitudeB, 2]];
    cutColor.sort(function (a, b) { return a[0] - b[0]; });
    return cutColor[cutColor.length - 1][1];//0=red, 1=green, 0=blue
}

function arrayChannelColor(colorsRGB, typeChannel) {
    let channel = [];
    for (let i = 0; i < colorsRGB.length; i += 3) {
        channel.push(colorsRGB[i][typeChannel]);
    }
    return channel;
}

function findMax(arrayColor) {
    let max = arrayColor.reduce(function (a, b) {
        return Math.max(a, b);
    })
    return max;
}

function findMin(arrayColor) {
    let min = arrayColor.reduce(function (a, b) {
        return Math.min(a, b);
    })
    return min;
}
