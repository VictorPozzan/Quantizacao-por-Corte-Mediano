const canvas = document.getElementById('canvas');
const canvas2d = canvas.getContext('2d');
const preQuantization = document.getElementById('pre-quantization');
const getPallet = document.getElementById('getPallet');

let pallet;
let indexColor = [];
let newImage = [];
let allColors = [];
let allIndex = [];
let num = 0;

window.addEventListener('load', function () {
    document.querySelector('input[type="file"]').addEventListener('change', function () {
        if (this.files && this.files[0]) {
            let img = document.querySelector('img');  // $('img')[0]
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
    ok("done1");
}

preQuantization.addEventListener("click", function (event) { //esta função serve para inicializar a pre quantização, ou seja achar as cores que a imagem vai possuir
    event.preventDefault;
    const numberColors = 256; //numero de cores que a nossa imagem deve ter 2^8=256
    preQuantizationFunction(numberColors);
});

getPallet.addEventListener("click", function (event) { //esta função serve para inicializar a pre quantização, ou seja achar as cores que a imagem vai possuir
    event.preventDefault;
    getPalletRGB();
});

save.addEventListener("click", function (event) {
    event.preventDefault;
    saveFile();
});

function ok(done) {
    finish = '&#x1F197';
    var id = document.getElementById(`${done}`);
    id.innerHTML = finish;
}

function saveFile() {

    image8bit = new BMP(newImage, pallet, canvas.width, canvas.height)

    image8bit.makeHeader()

    image8bit.makePixelData(num)

    image8bit.saveImage()

    ok("done4");
    console.log("FINISH")
}
function getPalletRGB() {
    format = " ";
    pallet.forEach(color => {
        [r, g, b] = color
        format += `<div style ="color :">${r}, ${g}, ${b}</div>`;
    });
    var id = document.getElementById('pal');
    id.innerHTML = format;
    ok("done3");
}

function preQuantizationFunction(numberColors) {
    let initImage = canvas2d.getImageData(0, 0, canvas.width, canvas.height);
    let dataImage = initImage.data; // dados de cada pixel da imagem 
    let lengthImage = dataImage.length; //quantidade de pixel
    let pixelVetor = [];

    for (let i = 0; i < lengthImage; i += 4) {
        let groupPixel = [dataImage[i], dataImage[i + 1], dataImage[i + 2]];
        //console.log("R:[i]"+dataImage[i]+",   G:[i+1]"+ dataImage[i+1]+",   B: [i+2]:"+dataImage[i+2]);
        pixelVetor.push(groupPixel);
    }

    let colorString = [...new Set(pixelVetor.map(color => color.toString()))];
    let colorsArr = colorString.map(color => color.split(','));

    /*let colorsArr = [[136, 0, 21], [136, 0, 21], [255, 174, 200], [255, 174, 200],
    [255, 174, 200], [185, 122, 87], [185, 122, 87], [140, 255, 251],
    [239, 228, 176], [239, 228, 176], [200, 191, 231], [196, 255, 14],
    [255, 127, 39], [34, 177, 76], [195, 195, 195], [195, 195, 195]
    ];*/

    let histogram = getHistogram(colorsArr);
    let sliceArrColors = [];

    medianCut(histogram, numberColors, sliceArrColors);

    pallet = getColors(sliceArrColors);

    //free vetors
    colorString = [];
    colorsArr = []

    const compareArrays = (arr1, arr2) => arr1.every((e, i) => +e === arr2[i])

    //verifica se o pixel Vetor é multiplo de 4
    if (canvas.width % 4 != 0) {
        let diff = canvas.width % 4;
        num = 4 - diff;
    }

    for (let i = pixelVetor.length - 1; i >= 0; i--) {
        for (let idx = 0; idx < allColors.length; idx++) {
            if (compareArrays(allColors[idx], pixelVetor[i])) {
                newImage.push(allIndex[idx])
                if (i % canvas.width == 0) {
                    for (let j = 0; j < num; j++) {
                        newImage.push(allIndex[idx])
                    }
                }
                break
            }
        }
    }

    console.log(newImage.length)
    ok("done2");
    console.log("finish pre-quantization 8 bits")
}
function getHistogram(corlorsArr) {
    let firstColor = [corlorsArr[0], 1];//primeira cor recebe 1 que significa que a cor apareceu uma vez
    let histogram = [];
    histogram.push(firstColor); //estrutura do histogram [[R, G, B], 1]
    corlorsArr.splice(0, 1);// remove o primeiro elemento do array ColorsArr pois este elemento já foi adicionado no histograma
    var beInHistogram;

    corlorsArr.forEach(function (item) {
        beInHistogram = false;
        histogram.forEach(function (itemHist) {
            const vetors_equals = item.every((e, i) => e === itemHist[0][i]) // compara se os vetores são iguais

            if (vetors_equals) {
                itemHist[1] = itemHist[1] + 1;
                beInHistogram = true;
                return;
            }
        });

        if (!beInHistogram) {
            let color = [item, 1];
            histogram.push(color);
        }
    });

    return histogram;
}


function medianCut(histogram, numberColors, sliceArrColors) {
    if (numberColors === 1) {
        sliceArrColors.push(histogram);
        return;
    } else {
        numberColors /= 2;
        let greaterBreadth = getGreaterAmplitude(histogram);
        histogram.sort(function (a, b) { return +a[0][greaterBreadth] - +b[0][greaterBreadth] });
        let numberPixels = getOcurrenceHistogram(histogram);
        let index = getIndexCutHistogram(histogram, numberPixels);
        let firstHalf = histogram.slice(0, index + 1);
        let secondHalf = histogram.slice(index + 1);
        medianCut(firstHalf, numberColors, sliceArrColors);
        medianCut(secondHalf, numberColors, sliceArrColors);
    }
}

function getOcurrenceHistogram(histogram) {
    let count = 0;
    histogram.forEach(function (item) {
        count = item[1] + count;
    });
    return count;
}


function getIndexCutHistogram(histogram, numberPixels) {
    let indexCut = numberPixels / 2;
    let acumulatorFrequence = 0;

    let cutPosition;

    for (let i = 0; i < histogram.length; i++) {
        acumulatorFrequence = histogram[i][1] + acumulatorFrequence;
        if (acumulatorFrequence == indexCut) {
            cutPosition = i;
            break;
        } else if (acumulatorFrequence > indexCut) {
            let diffNext = acumulatorFrequence - indexCut;
            let diffLast = indexCut - (acumulatorFrequence - histogram[i][1]);
            if (diffNext < diffLast) {
                cutPosition = i;
            } else {
                cutPosition = i - 1;
            }

            break;
        }
    }
    return cutPosition;
}

const histogram = arr => arr.reduce((result, item) => {
    result[item] = (result[item] || 0) + 1
    return result
}, {})

const pairs = obj => Object.keys(obj).map(key => [key, obj[key]])

function mode(arr) {
    let result = pairs(histogram(arr))
        .sort((a, b) => b[1] - a[1])
        .filter((item, index, source) => item[1] === source[0][1])
        .map(item => item[0])
    return result.length === arr.length ? [] : result
}


function getColors(sliceArrColors) {

    let colorSet = [];
    sliceArrColors.forEach((sliceColor, index) => {
        let red = 0, green = 0, blue = 0;
        let arrayRed = [], arrayGreen = [], arrayBlue = [];
        let arrayFrequence = [], arrayMpR = [], arrayMpG = [], arrayMpB = [];
        sliceColor.forEach(color => {
            //para calcular a moda
            arrayRed.push(color[0][0]);
            arrayGreen.push(color[0][1]);
            arrayBlue.push(color[0][2]);
            //para calcular a soma ponderada 
            arrayMpR.push(color[0][0] * color[1]);
            arrayMpG.push(color[0][1] * color[1]);
            arrayMpB.push(color[0][2] * color[1]);
            arrayFrequence.push(color[1]);
            let vetor = [color[0][0], color[0][1], color[0][2]]
            allColors.push(vetor)
            allIndex.push(index)
        });
        let r = mode(arrayRed);
        let g = mode(arrayGreen);
        let b = mode(arrayBlue);

        if (r.length == 1) {//moda
            red = parseInt(r[0]);
        } else {//soma ponderada
            let TotalR = arrayMpR.reduce((total, numero) => total + numero, 0);
            let TotalFrequence = arrayFrequence.reduce((total, numero) => total + numero, 0);
            red = Math.floor(TotalR / TotalFrequence);
        }

        if (g.length == 1) {
            green = parseInt(g[0]);
        } else {
            let TotalG = arrayMpG.reduce((total, numero) => total + numero, 0);
            let TotalFrequence = arrayFrequence.reduce((total, numero) => total + numero, 0);
            green = Math.floor(TotalG / TotalFrequence);
        }

        if (blue.length == 1) {
            blue = parseInt(b[0]);
        } else {
            let TotalB = arrayMpB.reduce((total, numero) => total + numero, 0);
            let TotalFrequence = arrayFrequence.reduce((total, numero) => total + numero, 0);
            blue = Math.floor(TotalB / TotalFrequence);
        }


        let pallet = [red, green, blue];
        colorSet.push(pallet);
    });
    arrayRed = [], arrayGreen = [], arrayBlue = [];
    arrayFrequence = [], arrayMpR = [], arrayMpG = [], arrayMpB = [];
    return colorSet;
}

function treatArray(colorsRGB) {
    let colors = [];
    colorsRGB.forEach(function (item) {
        colors.push(item[0]);
    });
    return colors;
}

function getGreaterAmplitude(colorsRGB) {
    let arrayR = [], arrayG = [], arrayB = [];
    let colors = treatArray(colorsRGB);
    arrayR = arrayChannelColor(colors, 0);
    arrayG = arrayChannelColor(colors, 1);
    arrayB = arrayChannelColor(colors, 2);

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

    arrayR = [], arrayG = [], arrayB = [];

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
