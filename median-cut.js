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


    let histogram = getHistogram(colorsArr);
    let sliceArrColors = [];

    medianCut(histogram, numberColors, sliceArrColors);

    pallet = getColors(sliceArrColors);
    console.log("Paleta de cores");
    console.log(pallet);
    for (let i = 0; i < pallet.length; i++) {
        console.log("Cor RGB:" + pallet[i]);
    }
}

function getHistogram(corlorsArr) {
    let firstColor = [corlorsArr[0], 1];//primeira cor recebe 1 que significa que a cor apareceu uma vez
    let histogram = [];
    histogram.push(firstColor); //estrutura do histogram [[R, G, B], 1]
    corlorsArr.splice(0, 1);// remove o primeiro elemento do array ColorsArr pois este elemento já foi adicionado no histograma
    var beInHistogram;

    corlorsArr.forEach(function (item, indece, array) {
        beInHistogram = false;
        histogram.forEach(function (itemHist, indexHist, arrayHist) {
            var vetors_equals = item.every(function (element, index) {//verifica se os vetores são iguais item === itemHist
                return element === itemHist[0][index];
            });
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

    console.log("histograma:");
    histogram.forEach(function (item, indece, array) {
        console.log(item);
    });
    return histogram;
}


function medianCut(histogram, numberColors, sliceArrColors) {
    if (numberColors === 1) {
        console.log("histograaaaaaaaaaaaaaama:");
        histogram.forEach(function (item) {
            console.log(item);
        });
        sliceArrColors.push(histogram);
        return;
    } else {
        numberColors /= 2;
        let greaterBreadth = getGreaterAmplitude(histogram); 
        console.log(greaterBreadth);

        histogram.sort(function (a, b) { return +a[0][greaterBreadth] -+b[0][greaterBreadth]}); 
        let numberPixels = getOcurrenceHistogram(histogram);
        let index = getIndexCutHistogram(histogram, numberPixels);
        let firstHalf = histogram.slice(0, index+1);
        let secondHalf = histogram.slice(index+1);
        //let half = Math.floor(colorsArr1.length / 2);
        //let firstHalf = colorsArr1.slice(0, half - 1);
        //let secondHalf = colorsArr1.slice(half);
        medianCut(firstHalf, numberColors, sliceArrColors);
        medianCut(secondHalf, numberColors, sliceArrColors);
    }
}

function getOcurrenceHistogram(histogram){
    let count = 0;
    histogram.forEach(function (item, indece, array) {
        count = item[1]+count;
    });
    return count;
}


function getIndexCutHistogram(histogram, numberPixels){
    let indexCut  = numberPixels/2;
    let acumulatorFrequence = 0;
    
    let cutPosition;

    for(let i=0; i<histogram.length; i++){
        acumulatorFrequence = histogram[i][1] + acumulatorFrequence;        
        if(acumulatorFrequence==indexCut){
            cutPosition = i;
            break;
        }else if(acumulatorFrequence>indexCut){
            let diffNext = acumulatorFrequence - indexCut;
            let diffLast = indexCut - (acumulatorFrequence - histogram[i][1]);
            if(diffNext < diffLast){
                cutPosition = i;
            }else{
                cutPosition = i-1;
            }
            
            break;
        }
    }
    return cutPosition;
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

function treatArray(colorsRGB){
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

    let cutColor = [[amplitudeR, 0], [amplitudeG, 1], [amplitudeB, 2]];
    cutColor.sort(function (a, b) { return a[0] - b[0]; });
    return cutColor[cutColor.length - 1][1];//0=red, 1=green, 0=blue
}

function arrayChannelColor(colorsRGB, typeChannel) {
    let channel = [];
    for (let i = 0; i < colorsRGB.length; i += 3) {
        channel.push(colorsRGB[i][typeChannel]);
        console.log("cores:"+colorsRGB[i]);
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
