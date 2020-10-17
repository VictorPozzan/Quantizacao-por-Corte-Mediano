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
    const numberColors = 256; //numero de cores que a nossa imagem deve ter 2^8=256
    
    let histogram = getHistogram();
    console.log(histogram);

    
    cutMedian(histogram);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getHistogram() {
    //Retorna um array com o histograma dos 3 canais
    //Em XHistogram a posiçao i tem o numero de ocorrencias da intensidade i 
    //Ex.: R=[36,0, ..., 0], G=[36,0, ..., 0], B=[36,0, ..., 0] quer dizer que a cor preta apareceu 36 vezes na imagem
    let image = canvas2d.getImageData(0, 0, canvas.width, canvas.height).data;
    let RHistogram = Array(256).fill(0);
    let GHistogram = Array(256).fill(0);
    let BHistogram = Array(256).fill(0);
    for (let i = 0; i < image.length; i += 4) {
        RHistogram[image[i]]++;
        GHistogram[image[i + 1]]++;
        BHistogram[image[i + 2]]++;
    }
    return [RHistogram, GHistogram, BHistogram];
}


function getMaiorAmplitude(RGBhistograms) {
    //Retorna o canal de maior amplitude e sua amplitude
    
    let maiorDiff = 0;
    let canalId;
    let amplitudeLinha;

    console.log("getMaiorAmplitude");
    console.log(RGBhistograms);
    for(let i=0; i<RGBhistograms.length; i++){
        amplitudeLinha = getAmplitude(RGBhistograms[i]);
        if(amplitudeLinha >= maiorDiff){
            canalId = i;
            maiorDiff = amplitudeLinha;
        }
    }

    return canalId;
}

function getAmplitude(hist) {
    //Retorna a amplitude do histograma
    //Ex.: freq = [0,0,0,3,2,0,1,0,6,0,0,0]; getAmplitude(freq) == 5
    let lowerLimit, upperLimit = 0;
    for (let i = 0; i < hist.length; i++) {
        if (hist[i] != 0) {
            lowerLimit = upperLimit = i;
            break;
        }
    }
    for (let i = (hist.length - 1); i > lowerLimit; i--) {
        if (hist[i] != 0) {
            upperLimit = i;
            break;
        }
    }
    //console.log(upperLimit, lowerLimit);
    return upperLimit - lowerLimit;
}

function cutMedian(histogram){
    console.log("histogram"+histogram);
    for(let i=0; i<1; i++){
        let greaterBreadth = getMaiorAmplitude(histogram); 
        console.log("maior amplitude;"+greaterBreadth);
        let half = getMedian(histogram[greaterBreadth]);
        let firstHalf = histogram.slice(0, half - 1);
        let secondHalf = histogram.slice(half, histogram[greaterBreadth].length);
        histogram = histogram.splice(greaterBreadth, 1, firstHalf, secondHalf);
        console.log("sssssssssssssssssssssssS");
        console.log(histogram);
    }

}

function getMedian(histogram){ 
    let indexCut;
    let intensity = 0;
    for(let i=0; i<histogram.length; i++){
        intensity += histogram[i];
    }

    console.log("Intensidade: "+intensity);
    indexCut = Math.floor(intensity/2);
    console.log("indexCut:"+indexCut);
    return indexCut;
}


function medianCut(colorsArr1, colorsArr2, numberColors, sliceArrColors, histogram) {
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
        medianCut(firstHalf, colorsArr1, numberColors, sliceArrColors, histogram);
        medianCut(secondHalf, colorsArr1, numberColors, sliceArrColors, histogram);
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