const ESPURL = "http://192.168.0.111";
const ANGLESTATUS = document.querySelector(".angleStatus");
const DISTANCESTATUS = document.querySelector(".distanceStatus");
const OBJECTSTATUS = document.querySelector(".objectStatus");
const STARTBUTTON = document.querySelector(".startButton");
const STOPBUTTON = document.querySelector(".stopButton");
const RADAR = document.querySelector(".radar");
const MAXDISTANCE = 400;
let percentage_distance = 0;
let flag = true;


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

const startScanning = async()=>{
    STARTBUTTON.style.display = "none";
    STOPBUTTON.style.display = "block";
    for (let i = 0; i <= 180; i++) {
        if(!flag){
            resetValues();
            break;
        }
        await renderObject(i);
        // if (RADAR.childNodes[197-i]) {
        //     RADAR.removeChild(RADAR.childNodes[197-i]);        
        // }

    }
    for (let i = 179; i >=1; i--) {
        if(!flag){
            resetValues();
            break;
        }
        await renderObject(i);
        // RADAR.removeChild(RADAR.childNodes[196-i]);
    }
    if(flag){
        STARTBUTTON.click();
    }else{
        flag = true;
    }
}

const stopScanning = ()=>{
    flag = false;
}

const resetValues= ()=> {
    STARTBUTTON.style.display = "block";
    STOPBUTTON.style.display = "none";
    DISTANCESTATUS.innerHTML= "? cm";
    ANGLESTATUS.innerHTML = "?°";
    OBJECTSTATUS.innerHTML = "Fuera de rango";
}

const renderObject = async (angle) =>{
    let object_sweep = document.createElement("div");
    object_sweep.classList.add('objectSweep');
    distance = await fetchDistance(angle);
    object_sweep.style.transform = `rotate(${angle-90}deg)`;
    RADAR.appendChild(object_sweep);
    DISTANCESTATUS.innerHTML=  distance + "cm";
    ANGLESTATUS.innerHTML= angle + "°";
    if(distance != "0"){
        percentage_distance= (parseInt(distance)*100)/MAXDISTANCE; //el último 100 es el valor máximo de alcance
        OBJECTSTATUS.innerHTML= "En rango";
        object_sweep.style.background = `linear-gradient(0deg, rgba(0,255,12,1) ${percentage_distance}%, rgba(245,0,0,1) ${percentage_distance}%)`;
    }else{
        OBJECTSTATUS.innerHTML= "Fuera de rango";
    }
}

STARTBUTTON.addEventListener('click', startScanning);
STOPBUTTON.addEventListener('click', stopScanning);