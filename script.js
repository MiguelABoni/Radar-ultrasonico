/*
  - NOMBRE DEL PROGRAMA: radar_ultrasonico --> E:\UNIVERSIDAD\TRABAJOS\SEMESTRE 5\ARQUITECTURA DE HARDWARE\PIF\RADAR ULTRASÓNICO\arduino\radar_ultrasonico.ino
  - DISEÑADORES: MIGUEL ÁNGEL BEDOYA BONILLA Y SANTIAGO RESTREPO IDÁRRAGA
  - CÓDIGO: 1001418288 Y 1001370117
  - FECHA INICIO: 01/03/2021
  - FECHA FINAL: 07/09/2021
  - VERSIÓN: V 1.0
  - DESCRIPCIÓN: Desarrollar, con ayuda del modulo (ESP32 lolin32) bajo la plataforma de desarrollo Arduino IDE, 
  -              una Aplicación Web conectada vía WIFI, que garantice la recolección de datos a través de un sensor ultrasónico (HC-SR04) 
  -              y la transferencia de datos mediante el protocolo HTTP (Hyper Text Transfer Protocol) hacia un dispositivo móvil y hacia una Base de Datos (Firebase).

*/

const ESPURL = "http://192.168.1.18"; //URL donde se encuentra el módulo ESP32 esperando peticiones
const BDURL = "https://radarultrasonico-default-rtdb.firebaseio.com/data/"; // URL de nuestra base de datos firebase
const ANGLESTATUS = document.querySelector(".angleStatus"); // Elemento HTML que contiene el ángulo que se está mostrando en el radar
const DISTANCESTATUS = document.querySelector(".distanceStatus"); // Elemento HTML que contiene la distancia que se está mostrando en el radar
const OBJECTSTATUS = document.querySelector(".objectStatus"); // Elemento HTML que contiene estado del objeto que se está mostrando en el radar
const STARTBUTTON = document.querySelector(".startButton"); // Elemento HTML encargado de servir como botón de inicio de escaneo
const STOPBUTTON = document.querySelector(".stopButton"); // Elemento HTML encargado de servir como botón de fin de escaneo
const RADAR = document.querySelector(".radar"); //Elemento HTML que contiene el radar
const MAXDISTANCE = 1000; //distancia máxima que será renderizada en el radar

let options; //Objeto JSON que contiene las propiedades de la petición PUT hacia firebase

let today; //Variable que será usada para guardar las fechas en tiempo real
let date_lap; //Variable que guardará la fecha y hora en el momento de terminar una vuelta o recorrido

let max_distance_BD = 0; //variable que albergará la máxima distancia que será enviada a la base de datos
let max_distance_date_hour; //variable que albergará la hora en que se encuentre la distancia máxima
let min_distance_BD = 0; //variable que albergará la mínima distancia que será enviada a la base de datos
let min_distance_date_hour;//variable que albergará la hora en que se encuentre la distancia mínima
let max_angle = 0; //variable que albergará el ángulo correspondiente a la distancia máxima encontrada
let min_angle = 0; //variable que albergará el ángulo correspondiente a la distancia mínima encontrada

let percentage_distance = 0; //variable donde guardaremos el porcentaje correspondiente a la distancia obtenida con respecto a la distancia máxima
let flag = true; //bandera para pausar la ejecución de nuestro radar o para volverla a reanudar
let flagInicialization = true; //bandera para inicializar los valores máximos y mínimos


const fetchDistance = async (angle) => { //función que se encargará de hacer la petición GET al módulo ESP32 enviando el ángulo como un header
    try{
        let distancePromise= await fetch(ESPURL,{ //Petición GET mediante fetch con la respectiva URL
            headers: new Headers({//Como la petición es GET la única manera de enviar datos a través de ella es a través de estos headers
                'Angulo':`${angle}`,
                'Longitud':`${angle.toString().length}`
            })
        });
        let distance = await distancePromise.json();//conversión de la petición a formato json
        return parseInt(distance.distancia) // retorno de la distancia en tipo INT ya que por defecto viene como string
    }catch(error){ //En caso de errores se verán en consola
        console.error(error);
    }
};

const startScanning = async()=>{ // Función encargada de iniciar la ejecución del radar
    STARTBUTTON.style.display = "none"; // Escondemos el botón de inicio
    STOPBUTTON.style.display = "block"; // Hacemos aparecer el botón de pausa
    flagInicialization = true; //Cada vez que comienza un nuevo recorrido, el flagInicialization debe estar en true para que los valores mínimos y máximos puedan ser inicializados
    for (let i = 0; i <= 180; i++) { // ciclo encargado de hacer girar al radar de 0 a 180 grados
        if(!flag){ // Si se presiona el botón de detener todos los valores se restablecerán
            resetValues();
            break; // Provoca la salida del for  en caso de que se presione el botón mientras está en ejecución
        }
        await renderObject(i); // renderizamos el elemento que debe mostrar la distancia obtenida
    }
    for (let i = 179; i >=1; i--) { // ciclo encargado de hacer girar al radar de 180 a 0 grados
        if(!flag){ // Si se presiona el botón de detener todos los valores se restablecerán
            resetValues();
            break; // Provoca la salida del for  en caso de que se presione el botón mientras está en ejecución
        }
        await renderObject(i); // renderizamos el elemento que debe mostrar la distancia obtenida
    }
    try {
        options = { // Definición del objeto options
            method: 'PUT',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({//Esto es lo que se enviará a la base de datos
                'minDistance': {
                    'angle': min_angle,
                    'date': min_distance_date_hour,
                    'distance': min_distance_BD
                },
                'maxDistance': {
                    'angle': max_angle,
                    'date': max_distance_date_hour,
                    'distance': max_distance_BD
                }
            })
        }
        await fetch(`${BDURL}${calculateDateHour()}.json`, options); // Petición PUT para hacer el registro de los datos encontrados en firebase
    } catch (error) { //En caso de errores se verán en consola
        console.error(error);
    }
    if(flag){//Mientras el botón de detenerse no sea presionado se seguirá presionando el botón de click que se encuentra oculto una vez termine el recorrido
        STARTBUTTON.click();
    }else{ //En caso de que detengamos la ejecución necesitamos reiniciar la bandera
        flag = true;
    }
}

const stopScanning = ()=>{// método encargado de poner la bandera en false
    flag = false;
}

const resetValues= ()=> { // método encargado de restablecer los valores en el panel del radar
    STARTBUTTON.style.display = "block";
    STOPBUTTON.style.display = "none";
    DISTANCESTATUS.innerHTML= "? cm";
    ANGLESTATUS.innerHTML = "?°";
    OBJECTSTATUS.innerHTML = "Fuera de rango";
}

const calculateDateHour = () => { // método encargado de calcular la fecha y hora actual cuando sea requerido
    today = new Date();
    let date = `${today.getDate()} - ${today.getMonth()+1} - ${today.getFullYear()}`;
    let hour = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return date + ' ' + hour;
}

const renderObject = async (angle) =>{// método encargado de renderizar el elemento del radar que mostrará la distancia con respecto al ángulo que llega por parámatro
    let object_sweep = document.createElement("div"); //elemento que será renderizado con la distancia correspondiente en porcentaje que se visualizará en colores verde y rojo
    object_sweep.classList.add('objectSweep'); // Añadimos estilos al elemento
    distance = await fetchDistance(180 - angle); //Hacemos llamado a la función la cual nos retornará la distancia traida del ESP32 con el ángulo que mandamos por parámetro
    object_sweep.style.transform = `rotate(${angle-90}deg)`; //rotamos el elemento n grados de acuerdo a lo que llegue por parámetro
    RADAR.appendChild(object_sweep); // renderizamos el elemento en el radar
    ANGLESTATUS.innerHTML= angle + "°"; // renderizamos el ángulo en el panel del radar
    if(distance != 0 ){ //condicional para no tomar en cuenta distancias iguales a 0 
        percentage_distance= (distance*100)/MAXDISTANCE; //Establecemos el porcentaje correspondiente a la distancia con respecto a la distancia máxima
        if (distance > MAXDISTANCE) { // En este condicional le diremos al usuario mediante el panel de control que el objeto se encuentra afuera del rango
            DISTANCESTATUS.innerHTML=  "? cm";
            OBJECTSTATUS.innerHTML= "Fuera de rango";    
        }else{ // entrará acá cuando la distancia encontrada no sea mayor a la máxima establecida
            if(flagInicialization){ // condicional para inicializar valores máximos y mínimos
                max_distance_BD = distance;
                min_distance_BD = distance;
                max_distance_date_hour = calculateDateHour();
                min_distance_date_hour = max_distance_date_hour;
                flagInicialization = false;
            }else{ // después de la inicialización compararemos las distancias con la primera hallada y así establecer los valores máximos y mínimos del recorrido
                if(distance > max_distance_BD){
                    max_distance_BD = distance;
                    max_distance_date_hour = calculateDateHour();
                    max_angle = angle;

                }else if(distance < min_distance_BD){
                    min_distance_BD = distance;
                    min_distance_date_hour = calculateDateHour();
                    min_angle = angle;
                }
            }
            DISTANCESTATUS.innerHTML=  distance + "cm"; // renderizamos la distancia en el panel del radar
            OBJECTSTATUS.innerHTML= "En rango"; // renderizamos el estado del objeto en el panel del radar
        }
        object_sweep.style.background = `linear-gradient(0deg, rgba(0,255,12,1) ${percentage_distance}%, rgba(245,0,0,1) ${percentage_distance}%)`; //renderizamos el elemento dependiendo del porcentaje al que esté el objeto detectado con colores rojo para lo detectado y verde para lo contrario
    }else{ // cuando la distancia sea igual a 0
        DISTANCESTATUS.innerHTML=  "? cm";
        OBJECTSTATUS.innerHTML= "Fuera de rango";
    }
}

STARTBUTTON.addEventListener('click', startScanning); // añadimos el evento startScanning al botón de inicio
STOPBUTTON.addEventListener('click', stopScanning); // añadimos el evento stopScanning al botón de pausa