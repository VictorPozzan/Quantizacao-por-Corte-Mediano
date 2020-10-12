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
    
    console.log(getHistogram());
}

function getHistogram(){
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