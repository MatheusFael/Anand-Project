// /*
//  * ANAND - MPU6050 + Firebase Realtime Database
//  * Envia dados de acelerômetro/giroscópio para Firebase em tempo real
//  * Compatível com ESP32 Standard, ESP32-C3, ESP32-S3
//  */

// #include <Wire.h>
// #include <WiFi.h>
// #include <FirebaseESP32.h>
// #include <math.h>

// // ====== CONFIGURAÇÃO WIFI ======
// #define WIFI_SSID "RONALDO FILHO 2G"
// #define WIFI_PASSWORD "25117858"

// // ====== CONFIGURAÇÃO FIREBASE ======
// #define FIREBASE_HOST "anand-project-3de15-default-rtdb.firebaseio.com"
// #define FIREBASE_AUTH ""  // Deixe vazio para Realtime Database em modo desenvolvimento

// // ====== CONFIGURAÇÃO I2C (AJUSTE CONFORME SEU MODELO) ======
// #define MPU_SDA 8    // Mude para 21 se usar ESP32 Standard
// #define MPU_SCL 9    // Mude para 22 se usar ESP32 Standard
// #define MPU_ADDR 0x68

// // ====== CONFIGURAÇÃO MPU6050 REGISTROS ======
// #define MPU_REG_ACCEL_X   0x3B
// #define MPU_REG_ACCEL_Y   0x3D
// #define MPU_REG_ACCEL_Z   0x3F
// #define MPU_REG_TEMP_H    0x41
// #define MPU_REG_GYRO_X    0x43
// #define MPU_REG_GYRO_Y    0x45
// #define MPU_REG_GYRO_Z    0x47
// #define MPU_REG_PWR_MGMT  0x6B

// // ====== VARIÁVEIS GLOBAIS ======
// FirebaseData fbdo;
// FirebaseConfig config;
// FirebaseAuth auth;

// // Dados brutos do sensor
// int16_t accelX, accelY, accelZ;
// int16_t gyroX, gyroY, gyroZ;

// // Ângulos calculados
// float pitch = 0.0, roll = 0.0;
// float pitchOffset = 0.0, rollOffset = 0.0;

// // Para calibração
// float accelX_sum = 0, accelY_sum = 0, accelZ_sum = 0;
// float gyroX_sum = 0, gyroY_sum = 0, gyroZ_sum = 0;

// // Filtro complementar
// unsigned long lastTime = 0;
// const float ALPHA = 0.96;  // Peso do giroscópio (0.96 = 96% gyro, 4% accel)
// const float GYRO_SCALE = 131.0;  // LSB/°/s
// const float ACCEL_SCALE = 16384.0;  // LSB/g

// // ====== FUNÇÕES ======

// /**
//  * Inicializa MPU6050
//  */
// void initMPU() {
//   Serial.println("[MPU] Inicializando...");
  
//   Wire.beginTransmission(MPU_ADDR);
//   Wire.write(MPU_REG_PWR_MGMT);
//   Wire.write(0x00);  // Acordar do sleep mode
//   Wire.endTransmission();
  
//   delay(100);
//   Serial.println("[MPU] OK");
// }

// /**
//  * Lê dados brutos do MPU6050
//  */
// void readMPU() {
//   Wire.beginTransmission(MPU_ADDR);
//   Wire.write(MPU_REG_ACCEL_X);
//   Wire.endTransmission(false);
  
//   Wire.requestFrom(MPU_ADDR, 14, true);
  
//   if (Wire.available() >= 14) {
//     accelX = (Wire.read() << 8) | Wire.read();
//     accelY = (Wire.read() << 8) | Wire.read();
//     accelZ = (Wire.read() << 8) | Wire.read();
    
//     Wire.read();  // Temp H
//     Wire.read();  // Temp L
    
//     gyroX = (Wire.read() << 8) | Wire.read();
//     gyroY = (Wire.read() << 8) | Wire.read();
//     gyroZ = (Wire.read() << 8) | Wire.read();
//   }
// }

// /**
//  * Calibração do sensor (200 leituras)
//  * A ESP fica parada e faz a média das leituras
//  */
// void calibrateMPU() {
//   Serial.println("[CALIB] Colocando ESP parada por 2 segundos...");
//   delay(2000);
  
//   Serial.println("[CALIB] Calibrando (200 leituras)...");
  
//   accelX_sum = 0, accelY_sum = 0, accelZ_sum = 0;
//   gyroX_sum = 0, gyroY_sum = 0, gyroZ_sum = 0;
  
//   for (int i = 0; i < 200; i++) {
//     readMPU();
    
//     accelX_sum += accelX;
//     accelY_sum += accelY;
//     accelZ_sum += accelZ;
//     gyroX_sum += gyroX;
//     gyroY_sum += gyroY;
//     gyroZ_sum += gyroZ;
    
//     delay(10);
//     if (i % 50 == 0) Serial.print(".");
//   }
  
//   Serial.println();
  
//   // Calcula offset do ângulo em repouso
//   float accelX_avg = accelX_sum / 200.0 / ACCEL_SCALE;
//   float accelY_avg = accelY_sum / 200.0 / ACCEL_SCALE;
//   float accelZ_avg = accelZ_sum / 200.0 / ACCEL_SCALE;
  
//   // Ângulos iniciais (posição neutra)
//   pitchOffset = atan2(accelY_avg, sqrt(accelX_avg*accelX_avg + accelZ_avg*accelZ_avg)) * 180.0 / PI;
//   rollOffset = atan2(-accelX_avg, accelZ_avg) * 180.0 / PI;
  
//   Serial.print("[CALIB] Pitch Offset: ");
//   Serial.print(pitchOffset);
//   Serial.print("°, Roll Offset: ");
//   Serial.println(rollOffset);
  
//   lastTime = millis();
// }

// /**
//  * Conecta ao WiFi
//  */
// void connectWiFi() {
//   Serial.print("[WiFi] Conectando a ");
//   Serial.println(WIFI_SSID);
  
//   WiFi.mode(WIFI_STA);
//   WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
//   int attempts = 0;
//   while (WiFi.status() != WL_CONNECTED && attempts < 20) {
//     delay(500);
//     Serial.print(".");
//     attempts++;
//   }
  
//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println();
//     Serial.print("[WiFi] Conectado! IP: ");
//     Serial.println(WiFi.localIP());
//   } else {
//     Serial.println();
//     Serial.println("[WiFi] FALHA na conexão!");
//   }
// }

// /**
//  * Conecta ao Firebase Realtime Database
//  */
// void connectFirebase() {
//   Serial.println("[Firebase] Conectando...");
  
//   config.host = FIREBASE_HOST;
//   config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
//   config.timeout.serverResponse = 2000;
  
//   Firebase.begin(&config, &auth);
//   Firebase.reconnectWiFi(true);
  
//   delay(1000);
  
//   if (Firebase.ready()) {
//     Serial.println("[Firebase] Conectado!");
//   } else {
//     Serial.println("[Firebase] Falha na conexão");
//   }
// }

// /**
//  * Envia dados para Firebase
//  */
// void sendToFirebase(float pitchRel, float rollRel) {
//   if (!Firebase.ready() || WiFi.status() != WL_CONNECTED) {
//     return;
//   }
  
//   FirebaseJson json;
//   json.set("pitch", pitchRel);
//   json.set("roll", rollRel);
//   json.set("updatedAt", millis());
  
//   if (Firebase.RTDB.setJSON(&fbdo, "/sensors/esp001", &json)) {
//     Serial.print("[Firebase] ✓ Enviado: pitch=");
//     Serial.print(pitchRel);
//     Serial.print("°, roll=");
//     Serial.print(rollRel);
//     Serial.println("°");
//   } else {
//     Serial.print("[Firebase] ✗ Erro: ");
//     Serial.println(fbdo.errorReason());
//   }
// }

// /**
//  * Setup (executado uma vez)
//  */
// void setup() {
//   Serial.begin(115200);
//   delay(1000);
  
//   Serial.println("\n================================");
//   Serial.println("ANAND - MPU6050 + Firebase");
//   Serial.println("================================\n");
  
//   // Inicializa I2C
//   Serial.print("[I2C] SDA=");
//   Serial.print(MPU_SDA);
//   Serial.print(", SCL=");
//   Serial.println(MPU_SCL);
//   Wire.begin(MPU_SDA, MPU_SCL);
//   Wire.setClock(400000);  // 400kHz I2C clock
  
//   delay(500);
  
//   // Inicializa MPU6050
//   initMPU();
  
//   delay(500);
  
//   // Conecta WiFi
//   connectWiFi();
  
//   delay(500);
  
//   // Conecta Firebase
//   connectFirebase();
  
//   delay(500);
  
//   // Calibra sensor
//   calibrateMPU();
  
//   Serial.println("\n[OK] Sistema pronto!");
//   Serial.println("Enviando dados a cada 500ms (2Hz)\n");
// }

// /**
//  * Loop (executado continuamente)
//  */
// void loop() {
//   // Lê dados do sensor
//   readMPU();
  
//   // Converte para valores reais
//   float accelX_g = accelX / ACCEL_SCALE;
//   float accelY_g = accelY / ACCEL_SCALE;
//   float accelZ_g = accelZ / ACCEL_SCALE;
//   float gyroX_dps = gyroX / GYRO_SCALE;
//   float gyroY_dps = gyroY / GYRO_SCALE;
  
//   // Calcula tempo desde última leitura
//   unsigned long currentTime = millis();
//   float dt = (currentTime - lastTime) / 1000.0;
//   lastTime = currentTime;
  
//   // Calcula pitch e roll a partir do acelerômetro
//   float accelPitch = atan2(accelY_g, sqrt(accelX_g*accelX_g + accelZ_g*accelZ_g)) * 180.0 / PI;
//   float accelRoll = atan2(-accelX_g, accelZ_g) * 180.0 / PI;
  
//   // Atualiza ângulos usando giroscópio
//   pitch += gyroY_dps * dt;
//   roll += gyroX_dps * dt;
  
//   // Filtro complementar (combina gyro com accel)
//   pitch = ALPHA * pitch + (1 - ALPHA) * accelPitch;
//   roll = ALPHA * roll + (1 - ALPHA) * accelRoll;
  
//   // Relativo à posição de calibração
//   float pitchRel = pitch - pitchOffset;
//   float rollRel = roll - rollOffset;
  
//   // Log local
//   Serial.print("Pitch: ");
//   Serial.print(pitchRel, 2);
//   Serial.print("°, Roll: ");
//   Serial.print(rollRel, 2);
//   Serial.println("°");
  
//   // Envia ao Firebase
//   sendToFirebase(pitchRel, rollRel);
  
//   // Aguarda antes da próxima leitura
//   delay(500);  // 2Hz
// }
