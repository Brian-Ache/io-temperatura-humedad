import { NextResponse } from "next/server";

export async function GET() {
  const BLYNK_TOKEN = "cndiZ6wanXlMRK0IScwY3Fp-fd53G9wa";
  const SERVIDOR_REGIONAL = "ny3.blynk.cloud"; 

  const URL_GET_ALL = `https://${SERVIDOR_REGIONAL}/external/api/getAll?token=${BLYNK_TOKEN}`;
  const URL_IS_CONNECTED = `https://${SERVIDOR_REGIONAL}/external/api/isHardwareConnected?token=${BLYNK_TOKEN}`;

  try {
    // Ejecutamos ambas consultas en paralelo para máxima velocidad
    const [resDatos, resConexion] = await Promise.all([
      fetch(URL_GET_ALL, { cache: 'no-store' }),
      fetch(URL_IS_CONNECTED, { cache: 'no-store' })
    ]);

    const estaOnlineRaw = await resConexion.text();
    const estaOnline = estaOnlineRaw.trim() === "true";

    // Si la ESP32 está apagada, cortamos acá y avisamos al cliente
    if (!estaOnline) {
      return NextResponse.json({ offline: true, temperatura: "--.-", humedad: "--.-" });
    }

    // Si está online, procesamos las variables del DHT11 de forma normal
    const todosLosPines = await resDatos.json();
    const temperatura = todosLosPines.V0 !== undefined ? String(todosLosPines.V0) : 
                        (todosLosPines.v0 !== undefined ? String(todosLosPines.v0) : "--.-");
    const humedad =     todosLosPines.V1 !== undefined ? String(todosLosPines.V1) : 
                        (todosLosPines.v1 !== undefined ? String(todosLosPines.v1) : "--.-");

    return NextResponse.json({ offline: false, temperatura, humedad });

  } catch (error: any) {
    return NextResponse.json({ error: "Fallo de comunicación con Blynk" }, { status: 500 });
  }
}
