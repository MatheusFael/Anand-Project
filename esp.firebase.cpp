#include <Wire.h>
#include <math.h>
#include <WiFi.h>
#include <IOXhop_FirebaseESP32.h>

// --- Credenciais ---
#define WIFI_SSID "RONALDO FILHO 2G"
#define WIFI_PASSWORD "25117858"
#define FIREBASE_HOST "https://anand-project-3de15-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "VdmTG0y1V2BXmr591fYhlWjIDvMnCjX80C1tgmG1"

#define MPU_ADDR 0x68

// ===== Variáveis Globais =====
float pitch = 0, roll = 0;
float erroGX = 0, erroGY = 0;
float pitchInicial = 0, rollInicial = 0;
unsigned long tempoAnterior;
unsigned long ultimoEnvio = 0;

void lerMPU(float &ax, float &ay, float &az, float &gx, float &gy) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14, true);
  if (Wire.available() < 14) return;

  int16_t axRaw = Wire.read() << 8 | Wire.read();
  int16_t ayRaw = Wire.read() << 8 | Wire.read();
  int16_t azRaw = Wire.read() << 8 | Wire.read();
  Wire.read(); Wire.read(); // skip temp
  int16_t gxRaw = Wire.read() << 8 | Wire.read();
  int16_t gyRaw = Wire.read() << 8 | Wire.read();

  ax = axRaw / 16384.0;
  ay = ayRaw / 16384.0;
  az = azRaw / 16384.0;
  // Subtrai o erro que vamos calcular no setup
  gx = (gxRaw / 131.0) - erroGX; 
  gy = (gyRaw / 131.0) - erroGY;
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  // 1. Wi-Fi Estável
  WiFi.mode(WIFI_STA);
  WiFi.setTxPower(WIFI_POWER_8_5dBm);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n✅ Wi-Fi OK!");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  // 2. Iniciar MPU
  Wire.begin(8, 9);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); Wire.write(0);
  Wire.endTransmission();

  // 3. CALIBRAÇÃO (O que faltava!)
  Serial.println("Calibrando... MANTENHA PARADO NA MESA");
  float sP = 0, sR = 0, sGX = 0, sGY = 0;
  
  for (int i = 0; i < 300; i++) {
    float ax, ay, az, gx_raw, gy_raw;
    // Leitura bruta para calcular o erro
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14, true);
    int16_t axR = Wire.read() << 8 | Wire.read();
    int16_t ayR = Wire.read() << 8 | Wire.read();
    int16_t azR = Wire.read() << 8 | Wire.read();
    Wire.read(); Wire.read();
    int16_t gxR = Wire.read() << 8 | Wire.read();
    int16_t gyR = Wire.read() << 8 | Wire.read();

    sGX += gxR / 131.0;
    sGY += gyR / 131.0;
    sP += atan2(ayR/16384.0, sqrt(pow(axR/16384.0, 2) + pow(azR/16384.0, 2))) * 180 / PI;
    sR += atan2(-axR/16384.0, azR/16384.0) * 180 / PI;
    delay(10);
  }
  erroGX = sGX / 300;
  erroGY = sGY / 300;
  pitchInicial = sP / 300;
  rollInicial = sR / 300;

  pitch = 0; roll = 0; // Zera o filtro
  tempoAnterior = millis();
  Serial.println("🚀 TUDO PRONTO!");
}

void loop() {
  float ax, ay, az, gx, gy;
  lerMPU(ax, ay, az, gx, gy);

  unsigned long agora = millis();
  float dt = (agora - tempoAnterior) / 1000.0;
  tempoAnterior = agora;

  float pAcc = atan2(ay, sqrt(ax*ax + az*az)) * 180 / PI;
  float rAcc = atan2(-ax, az) * 180 / PI;

  // Truque: Nos primeiros 5 segundos, o acelerômetro tem peso total (1.0)
  // Isso força o sensor a começar no ZERO real sem "drift"
  float alpha = (millis() < 7000) ? 0.0 : 0.94; 

  pitch = alpha * (pitch + gy * dt) + (1.0 - alpha) * pAcc;
  roll  = alpha * (roll + gx * dt) + (1.0 - alpha) * rAcc;

  float pRel = pitch - pitchInicial;
  float rRel = roll - rollInicial;

  if (agora - ultimoEnvio >= 500) {
    ultimoEnvio = agora;
    if (WiFi.status() == WL_CONNECTED) {
      Firebase.setFloat("/angulacao/horizontal", rRel);
      Firebase.setFloat("/angulacao/vertical", pRel);
      Serial.printf("H: %.2f | V: %.2f\n", rRel, pRel);
    }
  }
}