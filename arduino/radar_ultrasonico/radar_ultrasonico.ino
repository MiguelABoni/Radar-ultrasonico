#include <WiFi.h>
//#include <Servo.h>

WiFiServer server(80);

// credenciales de la red a la cual nos conectaremos
const char* ssid = "Idarraga";
const char* password = "luna2020";
String header; // Variable para guardar el HTTP request
String distancia ="{\"distancia\":\"\"";
String angulo;
String longitud_angulo;
String json="{\"angulo\":{";


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
            
            // Muestra la página web
            //angulo = "\"15\":\"15\","; 
            //json+=angulo;

            /*for(int i=15; i<=164; i++){
              //Poner a girar el servo
              angulo = "\""+String(i)+"\":\""+String(i)+"\","; 
              json+=angulo;              
            }
            angulo = "\"165\":\"165\""; 
            json+=angulo;
            json+="}}";
            client.println(json);
            json="{\"angulo\":{";*/
            longitud_angulo=header.substring(header.indexOf("longitud")+10,header.indexOf("longitud:")+11);
            angulo=header.substring(header.indexOf("angulo")+8,header.indexOf("angulo")+8+longitud_angulo.toInt());
            Serial.println(angulo);
            
            client.println("{\"distancia\":\""+angulo+"\"}");              
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
