// #include <Wire.h>
// #include <WiFi.h>
// #if __has_include(<FirebaseESP32.h>)
// #include <FirebaseESP32.h>
// #define USE_LEGACY_FIREBASE 1
// #elif __has_include(<Firebase_ESP_Client.h>)
// #include <Firebase_ESP_Client.h>
// #define USE_LEGACY_FIREBASE 0
// #else
// #error "Instale FirebaseESP32 ou Firebase_ESP_Client"
// #endif
// #include <math.h>
// #include <time.h>

// #define MPU_ADDR 0x68

// #define WIFI_SSID "RONALDO FILHO 2G"
// #define WIFI_PASSWORD "25117858"

// #define FIREBASE_HOST "anand-project-3de15-default-rtdb.firebaseio.com"
// #define FIREBASE_AUTH ""

// #define SENSOR_PATH "/sensors/esp001"

// #define I2C_SDA 8
// #define I2C_SCL 9

// #define NTP_SERVER "pool.ntp.org"
// #define GMT_OFFSET_SEC 0
// #define DAYLIGHT_OFFSET_SEC 0

// FirebaseData fbdo;
// #if !USE_LEGACY_FIREBASE
// FirebaseAuth fbAuth;
// FirebaseConfig fbConfig;
// #endif

// float pitch = 0;
// float roll = 0;
// float pitchAccFiltrado = 0;
// float rollAccFiltrado = 0;
// float pitchInicial = 0;
// float rollInicial = 0;

// unsigned long tempoAnterior = 0;
// bool firebaseReady = false;
// bool ntpSynced = false;

// bool checkWifi() {
//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.print("Conectando WiFi");
//     WiFi.mode(WIFI_STA);
//     WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//     unsigned long startAttemptTime = millis();
//     while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 12000) {
//       delay(500);
//       Serial.print(".");
//     }
//     Serial.println();
//   }
//   return WiFi.status() == WL_CONNECTED;
// }

// void firebaseInit() {
// #if USE_LEGACY_FIREBASE
//   Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
// #else
//   fbConfig.database_url = "https://anand-project-3de15-default-rtdb.firebaseio.com";
//   fbConfig.signer.tokens.legacy_token = FIREBASE_AUTH;
//   Firebase.begin(&fbConfig, &fbAuth);
// #endif
//   Firebase.reconnectWiFi(true);
//   Firebase.setReadTimeout(fbdo, 1000 * 15);
//   Firebase.setwriteSizeLimit(fbdo, "tiny");
//   firebaseReady = true;
// }

// void syncClock() {
//   configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
//   struct tm timeinfo;

//   Serial.print("Sincronizando NTP");
//   for (int i = 0; i < 20; i++) {
//     if (getLocalTime(&timeinfo, 500)) {
//       ntpSynced = true;
//       Serial.println(" -> OK");
//       return;
//     }
//     Serial.print(".");
//     delay(300);
//   }
//   Serial.println(" -> falhou, usando millis() para updatedAt");
// }

// double nowMs() {
//   if (ntpSynced) {
//     time_t now = time(nullptr);
//     if (now > 1700000000) {
//       return (double)now * 1000.0;
//     }
//   }
//   return (double)millis();
// }

// void lerMPU(float &ax, float &ay, float &az, float &gx, float &gy) {
//   Wire.beginTransmission(MPU_ADDR);
//   Wire.write(0x3B);
//   Wire.endTransmission(false);
//   Wire.requestFrom(MPU_ADDR, 14, true);

//   if (Wire.available() < 14) {
//     ax = 0;
//     ay = 0;
//     az = 1;
//     gx = 0;
//     gy = 0;
//     return;
//   }

//   int16_t axRaw = Wire.read() << 8 | Wire.read();
//   int16_t ayRaw = Wire.read() << 8 | Wire.read();
//   int16_t azRaw = Wire.read() << 8 | Wire.read();

//   Wire.read();
//   Wire.read();

//   int16_t gxRaw = Wire.read() << 8 | Wire.read();
//   int16_t gyRaw = Wire.read() << 8 | Wire.read();
//   Wire.read();
//   Wire.read();

//   ax = axRaw / 16384.0;
//   ay = ayRaw / 16384.0;
//   az = azRaw / 16384.0;
//   gx = gxRaw / 131.0;
//   gy = gyRaw / 131.0;
// }

// void calibrar() {
//   float somaPitch = 0;
//   float somaRoll = 0;

//   for (int i = 0; i < 200; i++) {
//     float ax, ay, az, gx, gy;
//     lerMPU(ax, ay, az, gx, gy);

//     float p = atan2(ay, sqrt(ax * ax + az * az)) * 180 / PI;
//     float r = atan2(-ax, az) * 180 / PI;

//     somaPitch += p;
//     somaRoll += r;
//     delay(10);
//   }

//   pitchInicial = somaPitch / 200;
//   rollInicial = somaRoll / 200;
// }

// void setup() {
//   Serial.begin(115200);
//   delay(1200);

//   Serial.println("INICIANDO...");

//   Wire.begin(I2C_SDA, I2C_SCL);

//   Wire.beginTransmission(MPU_ADDR);
//   Wire.write(0x6B);
//   Wire.write(0);
//   Wire.endTransmission();

//   Serial.println("MPU6050 OK");

//   if (checkWifi()) {
//     syncClock();
//     firebaseInit();
//     Serial.print("WiFi OK, IP: ");
//     Serial.println(WiFi.localIP());
//   } else {
//     Serial.println("WiFi nao conectado no setup. Tentara novamente no loop.");
//   }

//   Serial.println("Calibrando...");
//   calibrar();
//   Serial.println("Calibrado!");

//   tempoAnterior = millis();
//   Serial.println("PRONTO!");
// }

// void loop() {
//   float ax, ay, az, gx, gy;
//   lerMPU(ax, ay, az, gx, gy);

//   unsigned long tempoAtual = millis();
//   float dt = (tempoAtual - tempoAnterior) / 1000.0;
//   tempoAnterior = tempoAtual;

//   float pitchAcc = atan2(ay, sqrt(ax * ax + az * az)) * 180 / PI;
//   float rollAcc = atan2(-ax, az) * 180 / PI;

//   pitchAccFiltrado = 0.9 * pitchAccFiltrado + 0.1 * pitchAcc;
//   rollAccFiltrado = 0.9 * rollAccFiltrado + 0.1 * rollAcc;

//   float pitchGyro = pitch + gy * dt;
//   float rollGyro = roll + gx * dt;

//   const float alpha = 0.96;
//   pitch = alpha * pitchGyro + (1 - alpha) * pitchAccFiltrado;
//   roll = alpha * rollGyro + (1 - alpha) * rollAccFiltrado;

//   float pitchRel = pitch - pitchInicial;
//   float rollRel = roll - rollInicial;

//   Serial.print("Vertical: ");
//   Serial.print(pitchRel, 2);
//   Serial.print(" graus, Lateral: ");
//   Serial.print(rollRel, 2);
//   Serial.print(" graus");

//   if (checkWifi()) {
//     if (!firebaseReady) {
//       firebaseInit();
//     }

//     FirebaseJson json;
//     json.set("pitch", pitchRel);
//     json.set("roll", rollRel);
//     json.set("updatedAt", nowMs());

//     if (Firebase.RTDB.setJSON(&fbdo, SENSOR_PATH, &json)) {
//       Serial.println(" -> enviado ao Firebase");
//     } else {
//       Serial.print(" -> ERRO Firebase: ");
//       Serial.println(fbdo.errorReason());
//     }
//   } else {
//     Serial.println(" -> WiFi desconectado, pulando envio.");
//   }

//   delay(500);
// }