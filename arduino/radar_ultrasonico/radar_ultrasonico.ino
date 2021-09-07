/**************************************************************
  * NOMBRE DEL PROGRAMA: radar_ultrasonico --> E:\UNIVERSIDAD\TRABAJOS\SEMESTRE 5\ARQUITECTURA DE HARDWARE\PIF\RADAR ULTRASÓNICO\arduino\radar_ultrasonico.ino
  * DISEÑADORES: MIGUEL ÁNGEL BEDOYA BONILLA Y SANTIAGO RESTREPO IDÁRRAGA
  * CÓDIGO: 1001418288 Y 1001370117
  * FECHA INICIO: 01/03/2021
  * FECHA FINAL: 07/09/2021
  * VERSIÓN: V 1.0
  * DESCRIPCIÓN: Desarrollar, con ayuda del modulo (ESP32 lolin32) bajo la plataforma de desarrollo Arduino IDE, 
  *              una Aplicación Web conectada vía WIFI, que garantice la recolección de datos a través de un sensor ultrasónico (HC-SR04) 
  *              y la transferencia de datos mediante el protocolo HTTP (Hyper Text Transfer Protocol) hacia un dispositivo móvil y hacia una Base de Datos (Firebase).

**************************************************************/

#include <WiFi.h>
#include <ESP32Servo.h>

WiFiServer server(80);
Servo servo;

// credenciales de la red a la cual nos conectaremos
const char* ssid = "Restrepo Idarraga ";
const char* password = "43835089dia";
String header; // Variable para guardar el HTTP request
String angulo;
String longitud_angulo;
int cont_conexion=0;
int trig =27;
int echo = 26;
int duracion;
int distancia;


void setup(){
    Serial.begin(115200);

    // nos conectamos a la red
    WiFi.begin(ssid, password);
    Serial.println("Conectando");
    while(WiFi.status() != WL_CONNECTED && cont_conexion < 50) { 
      cont_conexion++;
      delay(500);
      Serial.print(".");
    }

    if(cont_conexion != 50){
      Serial.println("");
      Serial.print("Conectado a la red con la IP: ");
      Serial.print(WiFi.localIP());
      server.begin(); // iniciamos el servidor
      servo.attach(19);
      pinMode(trig,OUTPUT);
      pinMode(echo,INPUT);
    }else{
      Serial.println("");
      Serial.println("Error de conexión");
    }
}

void loop(){
  WiFiClient client = server.available();   // Escucha a los clientes entrantes
  if (client) {                             // Si se conecta un nuevo cliente
    String currentLine = "";                //
    while (client.connected()) {            // loop mientras el cliente está conectado
      if (client.available()) {             // si hay bytes para leer desde el cliente
        char c = client.read();             // lee un byte
        header += c;
        if (c == '\n') {                    // si el byte es un caracter de salto de linea
          // si la nueva linea está en blanco significa que es el fin del 
          // HTTP request del cliente, entonces respondemos:
          if (currentLine.length() == 0) {            
            client.println("HTTP/1.1 200 OK");         
            client.println("Access-Control-Allow-Origin: *"); //Para evitar errores a la hora de la petición     
            client.println("Content-type: application/json");//La respuesta será en forma de json
            client.println("Access-Control-Allow-Headers: Angulo,Longitud");//Para verificar que en la petición vengan todos los header posibles
            client.println("Connection: close");// Cerrar respuesta
            client.println();
            
            longitud_angulo=header.substring(header.indexOf("longitud")+10,header.indexOf("longitud:")+11); //Capturamos la longitud del ángulo que viene internamente en los headers de la petición
            angulo=header.substring(header.indexOf("angulo")+8,header.indexOf("angulo")+8+longitud_angulo.toInt()); //Capturamos el ángulo en la posición respectiva del header de la petición, para ello necesitabamos la longitud del mismo
            servo.write(angulo.toInt());
            
            distancia = calcularDistancia(); // calculamos la distancia en el ángulo que nos encontremos
            Serial.println(distancia);
            client.println("{\"distancia\":\""+String(distancia)+"\"}"); // Respuesta en formato json de la petición              
            // la respuesta HTTP temina con una linea en blanco
            client.println();
            break;
          } else { // si tenemos una nueva linea limpiamos currentLine
            currentLine = "";
          }
        } else if (c != '\r') {  // si C es distinto al caracter de retorno de carro
          currentLine += c;      // lo agrega al final de currentLine
        }
      }
    }
    // Limpiamos la variable header
    header = "";
    // Cerramos la conexión
    client.stop();
  }
}

int calcularDistancia(){ // función para calcular la distancia de un objeto con el sensor de ultrasonido
  
  /*digitalWrite(trig,HIGH); //Primera opción para calcular la distancia de acuerdo a la duración
  delay(1);
  digitalWrite(trig,LOW);
  duracion=pulseIn(echo,HIGH);*/
  
  digitalWrite(trig,LOW); //Segunda opción para calcular la distancia de acuerdo a la duración
  delayMicroseconds(2);
  digitalWrite(trig,HIGH);
  delayMicroseconds(10);
  digitalWrite(trig,LOW);
  duracion=pulseIn(echo,HIGH);
  return duracion/58;
}
