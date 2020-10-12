const canvas = document.getElementById('canvas');
const canvas2d = canvas.getContext('2d');
const preQuantization = document.getElementById('pre-quantization');


//let img = new Image();
//img.onload = main;
//img.crossOrigin = "";
//img.src = image;


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
    console.log("IHUL");
    console.log("Hello world");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas2d.drawImage(img, 0, 0);
    
}

function getMaiorAmplitude(RGBhistograms){
    //Retorna o canal de maior amplitude e sua amplitude
    let maiorDiff = 0;
    let canal;
    let ampR = getAmplitude(RGBhistograms[0]);
    let ampG = getAmplitude(RGBhistograms[1]);
    let ampB = getAmplitude(RGBhistograms[2]);
    
    if(ampR > ampG){
        maiorDiff = ampR;
        canal = "R";
    }else{
        maiorDiff = ampG;
        canal = "G";
    }
    if(ampB > maiorDiff){
        maiorDiff = ampB;
        canal = "B"
    }
    return [canal, maiorDiff]
}

function getAmplitude(hist){
    //Retorna a amplitude do histograma
    //Ex.: freq = [0,0,0,3,2,0,1,0,6,0,0,0]; getAmplitude(freq) == 5
    let lowerLimit, upperLimit = 0;
    for(let i=0; i<hist.length; i++){
        if(hist[i] != 0){
            lowerLimit = upperLimit = i; 
            break;
        }
    } 
    for(let i=(hist.length - 1); i>lowerLimit; i--){
        if(hist[i] != 0){
            upperLimit = i;
            break;
        }
    }
    console.log(upperLimit, lowerLimit);
    return upperLimit - lowerLimit;
}

function getHistogram(){
    //Retorna um array com o histograma dos 3 canais
    //Em XHistogram a posiçao i tem o numero de ocorrencias da intensidade i 
    //Ex.: R=[36,0, ..., 0], G=[36,0, ..., 0], B=[36,0, ..., 0] quer dizer que a cor preta apareceu 36 vezes na imagem
    let image = canvas2d.getImageData(0, 0, canvas.width, canvas.height).data;
    let RHistogram = Array(256).fill(0);
    let GHistogram = Array(256).fill(0);
    let BHistogram = Array(256).fill(0);
    for(let i=0; i<image.length; i+=4){
        RHistogram[image[i]]++;
        GHistogram[image[i+1]]++;
        BHistogram[image[i+2]]++;
    }
    return [RHistogram, GHistogram, BHistogram];
}

preQuantization.addEventListener("click", function(event){ //esta função serve para inicializar a pre quantização, ou seja achar as cores que a imagem vai possuir
    event.preventDefault;
    const numberColors = 256; //numero de cores que a nossa imagem deve ter 2^8=256
    let pallet = getPallet(numberColors); 
});

function getPallet (numberColors){ // retorna a paleta de cores
    let initImage = canvas2d.getImageData(0, 0, canvas.width, canvas.height); //pegar as dimensões da imagem inicial
    //let finalImage = canvas2d.createImagData(0, 0, canvas.width, canvas.height); //criar uma imagem a partir da imagem inicial

    let pallet;
    // pergar a paleta de cores da imagem
    let dataImage = initImage.data; // dados de cada pixel da imagem 
    let lengthImage = dataImage.length; //quantidade de pixel
    let pixelVetor = [];
    
    console.log("Dados da da Imegem");
    console.log("length"+lengthImage);
    console.log("dataImage:"+dataImage);

    for(let i=0; i<lengthImage; i+=4){
        let groupPixel = [dataImage[i], dataImage[i+1], dataImage[i+2]];
        console.log('--------------------------------------------');
        console.log("R:[i]"+dataImage[i]+",   G:[i+1]"+ dataImage[i+1]+",   B: [i+2]:"+dataImage[i+2]);
        pixelVetor.push(groupPixel);
    }

    console.log()
};