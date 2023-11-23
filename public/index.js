document.getElementById("output_image").style.display = "block";
var slider = document.getElementById("change_maxframe");
var output = document.getElementById("maxframe");

slider.oninput = function() {
    output.innerHTML = "Max Frame: " + this.value;
    drawNew(this.value);
}

function preview_image(event){
    let reader = new FileReader();
    reader.onload = function(){
        input = new Image();
        input.src = reader.result;
        input.onload = ()=>{
            editimage();
        }
       
    }
    reader.readAsDataURL(event.target.files[0]);
}
let imgs;
let width, height, canvas, ctx, input;
async function editimage(){
    canvas = document.getElementById("canvas")
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext("2d", {willReadFrequently: true});
    imgs = await getAllImageData(ctx,canvas);
    drawNew(slider.value);
}

function drawNew(maxframe){
    ctx.fillStyle = "white"
    ctx.fillRect(0,0,width,height);
    ctx.drawImage(input,0,0, width, height)
    let inputdata = ctx.getImageData(0, 0,width, height);
    window.inputdata = inputdata;
    let outputdata = ctx.createImageData(width, height)
    for(let x = 0; x < width; x++){
        for(let y = 0; y < width;y++){
            let color = getPixel(inputdata, x,y);
            let framei = Math.floor(maxframe * (color.r + color.g + color.b) / (256 * 3));
            setPixel(outputdata, x, y, getPixel(imgs[maxframe - framei - 1], x,y))
        }
    }
    ctx.putImageData(outputdata, 0,0)

}

async function getAllImageData(ctx, canvas){
    let imgs = [];
    for(let i = 1; i <= 60;i++){
        let frame = await getFrame(i);
        ctx.drawImage(frame,0,0, canvas.width, canvas.height)
        imgs.push(ctx.getImageData(0, 0,canvas.width, canvas.height));
    }
    return imgs;
}

async function getFrame(i){
    let filename = "frames/frame" + i.toString().padStart("4", '0') + ".png";
    let img = new Image();
    img.src = filename;
    img.crossOrigin = "anonymous";
    let resprom;
    let ret = new Promise((resolve, reject) => {
        resprom = resolve;
    })
    img.onload = ()=>{
        resprom(img);
    }
    return ret;
    
}

function getPixel(imagedata, x,y){
    const red = y * (width * 4) + x * 4;
    return {
        r: imagedata.data[red],
        g: imagedata.data[red+1],
        b: imagedata.data[red+2],
        a: imagedata.data[red+3],
    }
}

function setPixel(imagedata, x,y, colobj){
    const red = y * (width * 4) + x * 4;
    imagedata.data[red] = colobj.r;
    imagedata.data[red+1] = colobj.g;
    imagedata.data[red+2] = colobj.b;
    imagedata.data[red+3] = colobj.a;
}

