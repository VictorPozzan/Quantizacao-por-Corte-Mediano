class BMP {
    HEADER_SIZE = 54 
    BYTES = 1
    MAGIC_NUMBER = 0x424D
    LITTLE_ENDIAN = true
    bitPos = 0

    constructor(imageArray = [], pallet = [], width, height) {
        /* 
            @param ImageArray: Image array like [[r,g,b]]
        */

        this.image = imageArray

        this.pallet = pallet

        this.w = width 
        this.h = height 

        this.imageSize = this._setImageSize()

        this.bitArray = new Uint8Array(this.HEADER_SIZE + this.image.length + (this.pallet.length * 4))
        this.view = new DataView(this.bitArray.buffer)
        this.data;
    }

    _setImageSize() {
        return (this.w * this.h * this.BYTES) 
    }
    //head - fixo em todo .bmp
    makeHeader() {
        // BM magic number.
        this.view.setUint16(0, this.MAGIC_NUMBER, !this.LITTLE_ENDIAN);
        // File size.
        this.view.setUint32(2, this.bitArray.length, this.LITTLE_ENDIAN);
        // Offset to image data.
        this.view.setUint32(10, this.HEADER_SIZE, this.LITTLE_ENDIAN);

        // BITMAPINFOHEADER

        // Size of BITMAPINFOHEADER
        this.view.setUint32(14, 40, this.LITTLE_ENDIAN);
        // Width
        this.view.setInt32(18, this.w, this.LITTLE_ENDIAN);
        // Height (signed because negative values flip
        // the image vertically).
        this.view.setInt32(22, this.h, this.LITTLE_ENDIAN);
        // Number of colour planes (colours stored as
        // separate images; must be 1).
        this.view.setUint16(26, 1, this.LITTLE_ENDIAN);
        // Bits per pixel.
        this.view.setUint16(28, 8, this.LITTLE_ENDIAN);
        // Compression method, 0 = BI_RGB
        this.view.setUint32(30, 0, this.LITTLE_ENDIAN);
        // Image size in bytes.
        this.view.setUint32(34, this.imageSize, this.LITTLE_ENDIAN);
        // Horizontal resolution, pixels per metre.
        // This will be unused in this situation.
        this.view.setInt32(38, 0, this.LITTLE_ENDIAN);
        // Vertical resolution, pixels per metre.
        this.view.setInt32(42, 0, this.LITTLE_ENDIAN);
        // Number of colours. 0 = all
        this.view.setUint32(46, 0, this.LITTLE_ENDIAN);
        // Number of important colours. 0 = all
        this.view.setUint32(50, 0, this.LITTLE_ENDIAN);

        this.bitPos = 54

        // Escreve a paleta de cores no arquivo. Um 0 é adicionado ao final de cada cor por se tratar de um campo reservado
        this.pallet.forEach(([r, g, b]) => {
            this.view.setUint8(this.bitPos, b, !this.LITTLE_ENDIAN)
            this.view.setUint8(this.bitPos + 1, g, !this.LITTLE_ENDIAN)
            this.view.setUint8(this.bitPos + 2, r, !this.LITTLE_ENDIAN)
            this.view.setUint8(this.bitPos + 3, 0, !this.LITTLE_ENDIAN)

            this.bitPos += 4
        })


    }

    //escreve indice referente a cor [r,g,b] no arquivo em ordem contraria.
    makePixelData(num) {
        console.log(this.bitArray.length);
        let controlHeight = this.h
        while (controlHeight != 0) {
            let imagePart = this.image.splice(0, this.w+num)
            imagePart.reverse().forEach(colorIdx => {
                this.view.setUint8(this.bitPos, colorIdx, this.LITTLE_ENDIAN)
                this.bitPos++;
            })

            controlHeight--
        }
        console.log(this.view.length)
    }

    saveImage() {
        let blob = new Blob([this.view], { type: "application/octet-stream" });
        saveAs(blob, "test.bmp");
    }
}
