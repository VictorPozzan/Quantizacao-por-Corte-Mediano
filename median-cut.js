const canvas = document.getElementById('canvas');
const canvas2d = canvas.getContext('2d');


//let img = new Image();
//img.onload = main;
//img.crossOrigin = "";
//img.src = image;

window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var img = document.querySelector('img');  // $('img')[0]
            img.src = URL.createObjectURL(this.files[0]); // set src to blob url
            img.onload = main;
        }
    });
  });

function main(){
    constructCanvas(this);
}

function constructCanvas(img){
    console.log("IHUL");
    canvas.width = img.naturalWidth;
    canvas.height= img.naturalHeigt;
    canvas2d.drawImage(img, 0 ,0);
}