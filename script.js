const ESPURL = "http://192.168.0.110";
const ANGLESTATUS = document.querySelector(".angleStatus");
const DISTANCESTATUS = document.querySelector(".distanceStatus");
const SWEEP = document.querySelector(".sweep");
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
    // BUTTON.addEventListener('click', stopScanning);  
    for (let i = 0; i <= 180; i++) {
        DISTANCESTATUS.innerHTML= await fetchDistance(i) + "cm";
        ANGLESTATUS.innerHTML= i + "°";
        SWEEP.style.transform= `rotate(${i-90}deg)`
    }
    for (let i = 179; i >=1; i--) {
        DISTANCESTATUS.innerHTML= await fetchDistance(i) + "cm";
        ANGLESTATUS.innerHTML= i + "°";
        SWEEP.style.transform= `rotate(${i-90}deg)`
    }
    BUTTON.click();
}

BUTTON.addEventListener('click', startScanning);