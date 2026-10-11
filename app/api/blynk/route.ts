import { NextResponse } from "next/server";

export async function GET() {
  const BLYNK_TOKEN = "cndiZ6wanXlMRK0IScwY3Fp-fd53G9wa";
  const SERVIDOR_REGIONAL = "ny3.blynk.cloud"; 

  // Endpoint unificado para leer sensores y endpoint oficial para ver si la placa está online
  const URL_GET_ALL = `https://${SERVIDOR_REGIONAL}/external/api/getAll?token=${BLYNK_TOKEN}`;
  const URL_IS_CONNECTED = `https://${SERVIDOR_REGIONAL}/external/api/isHardwareConnected?token=${BLYNK_TOKEN}`;

  try {
    // Hacemos las dos consultas en paralelo al servidor regional
    const [resDatos, resConexion] = await Promise.all([
      fetch(URL_GET_ALL, { cache: 'no-store' }),
      fetch(URL_IS_CONNECTED, { cache: 'no-store' })
    ]);

    // Blynk responde "true" o "false" en formato texto plano al consultar la conexión
    const estaOnlineRaw = await resConexion.text();
    const estaOnline = estaOnlineRaw.trim() === "true";

    // Si la ESP32 está apagada/desconectada, forzamos guiones en la web para avisarle al usuario
    if (!estaOnline) {
      return NextResponse.json({ 
        temperatura: "--.-", 
        humedad: "--.-", 
        modo: "OFFLINE ❌ (ESP32 Desconectada)" 
      });
    }

    // Si está online, procesamos los datos reales del sensor normalmente
    const todosLosPines = await resDatos.json();
    const temperatura = todosLosPines.V0 !== undefined ? String(todosLosPines.V0) : 
                        (todosLosPines.v0 !== undefined ? String(todosLosPines.v0) : "--.-");
    const humedad =     todosLosPines.V1 !== undefined ? String(todosLosPines.V1) : 
                        (todosLosPines.v1 !== undefined ? String(todosLosPines.v1) : "--.-");
    const modo =        todosLosPines.V2 !== undefined ? String(todosLosPines.V2) : 
                        (todosLosPines.v2 !== undefined ? String(todosLosPines.v2) : "unknown");

    return NextResponse.json({ temperatura, humedad, modo });

  } catch (error: any) {
    return NextResponse.json({ error: "Error en el Bridge seguro" }, { status: 500 });
  }
}
