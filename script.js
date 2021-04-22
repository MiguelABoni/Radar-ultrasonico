const ESPURL = "http://192.168.0.105";
const ANGLESTATUS = document.querySelector(".angleStatus");
const DISTANCESTATUS = document.querySelector(".distanceStatus");
const SWEEP = document.querySelector(".sweep");
const BUTTON = document.querySelector(".startButton"); 
const RADAR = document.querySelector(".radar");
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

// const stopScanning = ()=>{

// }

const startScanning= async()=>{
    // BUTTON.classList.add("stopButton");
    // BUTTON.addEventListener('click', stopScanning);  
    for (let i = 0; i <= 180; i++) {
        distance = await fetchDistance(i);
        if(distance != "0"){
            debugger
            let object_sweep = document.createElement("div");
            let percentage_distance= (parseInt(distance)*100)/100;
            object_sweep.style.background = `linear-gradient(93deg, rgba(245,0,0,1) ${percentage_distance}%, rgba(0,255,12,1) ${100-percentage_distance}%)`;
            object_sweep.style.transform = `rotate(${i-90}deg)`;
            object_sweep.classList.add('objectSweep');
            RADAR.appendChild(object_sweep);
            
        }
        DISTANCESTATUS.innerHTML=  distance + "cm";
        ANGLESTATUS.innerHTML= i + "°";
        SWEEP.style.transform= `rotate(${i-90}deg)`
    }
    for (let i = 179; i >=1; i--) {
        distance = await fetchDistance(i);
        DISTANCESTATUS.innerHTML=  distance + "cm";
        ANGLESTATUS.innerHTML= i + "°";
        SWEEP.style.transform= `rotate(${i-90}deg)`
    }
    BUTTON.click();
}

BUTTON.addEventListener('click', startScanning);