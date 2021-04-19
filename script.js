const ESPURL = "http://192.168.0.107";
const BUTTON = document.querySelector(".startButton"); 
const fetchDistance = async (angle) => {
    try{
        let distancePromise= await fetch(ESPURL,{
            headers: new Headers({
                'Angulo':`${angle}`,
                'Longitud':`${angle.toString().length}`
            })
        });
        let distance = await distancePromise.json();
        return distance.distancia
    }catch(error){
        console.error(error);
    }
};

const startScanning= async()=>{
    setInterval(()=>{
    BUTTON.click();
    },24000);
    // BUTTON.addEventListener('click', stopScanning);  
    for (let i = 15; i <= 165; i++) {
        console.log(await fetchDistance(i));
    }
    for (let i = 164; i >=16; i--) {
        console.log(await fetchDistance(i));
    }
}

BUTTON.addEventListener('click', startScanning);