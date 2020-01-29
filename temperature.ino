#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT11
#define sensor A0
#define led 3

DHT dht(DHTPIN, DHTTYPE);

void setup()
{
  Serial.begin(9600);
  dht.begin();
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
}

void loop()
{
  int air_quality = analogRead(sensor);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  delay(2000);

  Serial.print("Temperature: ");
  Serial.println(t);
  Serial.print("Humidity: ");
  Serial.println(h);
  Serial.print("Air_Quality: ");
  Serial.println(air_quality);

  if (t >= 35 || air_quality >= 400)  {
    digitalWrite(led, HIGH);
  }  else  {
    digitalWrite(led, LOW);
  }
}