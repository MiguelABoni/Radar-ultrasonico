#include <WiFi.h>
#include <ESP32Servo.h>

WiFiServer server(80);
Servo servo;

// credenciales de la red a la cual nos conectaremos
const char* ssid = "HOME-0572";
const char* password = "FBE902627C401F3E";
String header; // Variable para guardar el HTTP request
String angulo;
String longitud_angulo;
String json="{\"angulo\":{";
int trig =27;
int echo = 26;
int duracion;
int distancia;


void setup(){
    Serial.begin(115200);

    // nos conectamos a la red
    WiFi.begin(ssid, password);
    Serial.println("Connecting");
    while(WiFi.status() != WL_CONNECTED) { 
    delay(500);
    Serial.print(".");
    }
    Serial.println("");
    Serial.print("Conectado a la red con la IP: ");
    Serial.print(WiFi.localIP());
    server.begin(); // iniciamos el servidor
    servo.attach(19);
    pinMode(trig,OUTPUT);
    pinMode(echo,INPUT);
}

void loop(){
  WiFiClient client = server.available();   // Escucha a los clientes entrantes

  if (client) {                             // Si se conecta un nuevo cliente
    //Serial.println("New Client.");          // 
    String currentLine = "";                //
    while (client.connected()) {            // loop mientras el cliente está conectado
      if (client.available()) {             // si hay bytes para leer desde el cliente
        char c = client.read();             // lee un byte
        //Serial.write(c);                    // imprime ese byte en el monitor serial
        header += c;
        if (c == '\n') {                    // si el byte es un caracter de salto de linea
          // si la nueva linea está en blanco significa que es el fin del 
          // HTTP request del cliente, entonces respondemos:
          if (currentLine.length() == 0) {            
            client.println("HTTP/1.1 200 OK");         
            client.println("Access-Control-Allow-Origin: *");          
            client.println("Content-type: application/json");
            client.println("Access-Control-Allow-Headers: Angulo,Longitud");
            client.println("Connection: close");
            client.println();
            
            longitud_angulo=header.substring(header.indexOf("longitud")+10,header.indexOf("longitud:")+11);
            angulo=header.substring(header.indexOf("angulo")+8,header.indexOf("angulo")+8+longitud_angulo.toInt());
            
            servo.write(angulo.toInt());
            
            /*digitalWrite(trig,HIGH);
            delay(1);
            digitalWrite(trig,LOW);
            duracion=pulseIn(echo,HIGH);*/
            digitalWrite(trig,LOW);
            delayMicroseconds(2);
            digitalWrite(trig,HIGH);
            delayMicroseconds(10);
            digitalWrite(trig,LOW);
            duracion=pulseIn(echo,HIGH);
            distancia = duracion/58;
            client.println("{\"distancia\":\""+String(distancia)+"\"}");              
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
    //Serial.println("Client disconnected.");
    //Serial.println("");
  }
}
