#include <Wire.h>
#include <math.h>
#include <Wifi.h>
#include <FirebaseESP32.h>

#define MPU_ADDR 0x68

#define WIFI_SSID "RONALDO FILHO 2G"
#define WIFI_PASSWORD "25117858"

#define FIREBASE_HOST "anand-project-3de15-default-rtdb.firebaseio.com" // substitua se necessário
#define FIREBASE_AUTH "" // deixar vazio em modo de teste; em produção use token de serviço

#define SENSOR_PATH "/sensors/esp001"

FirebaseData fbdo;

bool checkWifi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Conectando WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();
  }
  return WiFi.status() == WL_CONNECTED;
}

void firebaseInit() {
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
}

// ===== Ângulos =====
float pitch = 0;
float roll  = 0;

float pitchAccFiltrado = 0;
float rollAccFiltrado  = 0;

// posição neutra
float pitchInicial = 0; 
float rollInicial  = 0;

unsigned long tempoAnterior;

// ======================
// LEITURA (SUBSTITUI A BIBLIOTECA)
// ======================
void lerMPU(float &ax, float &ay, float &az, float &gx, float &gy) {

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 14, true);

  int16_t axRaw = Wire.read() << 8 | Wire.read();
  int16_t ayRaw = Wire.read() << 8 | Wire.read();
  int16_t azRaw = Wire.read() << 8 | Wire.read();

  Wire.read(); Wire.read(); // temp

  int16_t gxRaw = Wire.read() << 8 | Wire.read();
  int16_t gyRaw = Wire.read() << 8 | Wire.read();
  Wire.read(); Wire.read(); // gz

  // conversão (igual à lib)
  ax = axRaw / 16384.0;
  ay = ayRaw / 16384.0;
  az = azRaw / 16384.0;

  gx = gxRaw / 131.0;
  gy = gyRaw / 131.0;
}

// ======================
// Calibração (MESMA LÓGICA)
// ======================
void calibrar() {

  float somaPitch = 0;
  float somaRoll  = 0;

  for (int i = 0; i < 200; i++) {

    float ax, ay, az, gx, gy;
    lerMPU(ax, ay, az, gx, gy);

    float p = atan2(ay, sqrt(ax*ax + az*az)) * 180 / PI;
    float r = atan2(-ax, az) * 180 / PI;

    somaPitch += p;
    somaRoll  += r;

    delay(10);
  }

  // 🔴 CORREÇÃO IMPORTANTE
  pitchInicial = somaPitch / 200;
  rollInicial  = somaRoll  / 200;
}

// ======================
void setup() {

  Serial.begin(115200);
  delay(2000);

  Serial.println("INICIANDO...");

  // 🔴 ESSENCIAL no ESP32-C3
  Wire.begin(8, 9);

  // 🔴 ACORDAR MPU
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission();

  Serial.println("MPU6050 OK");

  delay(2000);

  Serial.println("Calibrando...");
  calibrar();
  Serial.println("Calibrado!");

  tempoAnterior = millis();

  Serial.println("PRONTO!");

  if (checkWifi()) {
    firebaseInit();
  }
}

// ======================
void loop() {

  float ax, ay, az, gx, gy;
  lerMPU(ax, ay, az, gx, gy);

  // tempo
  unsigned long tempoAtual = millis();
  float dt = (tempoAtual - tempoAnterior) / 1000.0;
  tempoAnterior = tempoAtual;

  // ===== Acelerômetro =====
  float pitchAcc = atan2(ay, sqrt(ax*ax + az*az)) * 180 / PI;
  float rollAcc  = atan2(-ax, az) * 180 / PI;

  pitchAccFiltrado = 0.9 * pitchAccFiltrado + 0.1 * pitchAcc;
  rollAccFiltrado  = 0.9 * rollAccFiltrado  + 0.1 * rollAcc;

  // ===== Giroscópio =====
  float pitchGyro = pitch + gy * dt;
  float rollGyro  = roll  + gx * dt;

  // ===== Filtro complementar (SEU ORIGINAL)
  const float alpha = 0.96;

  pitch = alpha * pitchGyro + (1 - alpha) * pitchAccFiltrado;
  roll  = alpha * rollGyro  + (1 - alpha) * rollAccFiltrado;

  // ===== Relativo à posição neutra (SEU CONCEITO)
  float pitchRel = pitch - pitchInicial;
  float rollRel  = roll  - rollInicial;

  // ===== Saída local UART (igual)
  Serial.print("Vertical: ");
  Serial.print(pitchRel);

  Serial.print("°, Lateral: ");
  Serial.print(rollRel);
  Serial.print("°");

  // ===== Enviar para Firebase Realtime Database
  if (WiFi.status() == WL_CONNECTED) {
    String path = String(SENSOR_PATH);

    FirebaseJson json;
    json.set("pitch", pitchRel);
    json.set("roll", rollRel);
    json.set("updatedAt", millis());

    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println(" -> enviado ao Firebase");
    } else {
      Serial.print("ERRO Firebase: ");
      Serial.println(fbdo.errorReason());
    }
  } else {
    Serial.println("WiFi desconectado, pulando envio.");
  }

  delay(500); // taxa de 2Hz (ajuste se necessário)
}