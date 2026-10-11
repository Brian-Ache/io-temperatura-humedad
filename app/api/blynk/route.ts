import { NextResponse } from "next/server";

export async function GET() {
  // Credencial oficial de tu dispositivo Blynk IoT
  const BLYNK_TOKEN = "cndiZ6wanXlMRK0IScwY3Fp-fd53G9wa";
  
  // ⚠️ Configura el servidor de tu región (ny3 es el estándar para América)
  const SERVIDOR_REGIONAL = "ny3.blynk.cloud"; 

  // Endpoint unificado oficial para leer múltiples Datastreams en un solo viaje
  const URL_GET_ALL = `https://${SERVIDOR_REGIONAL}/external/api/getAll?token=${BLYNK_TOKEN}`;

  try {
    const respuestaBlynk = await fetch(URL_GET_ALL, { 
        next: { revalidate: 15 } // Guarda el dato en caché por 15 segundos para todo el mundo
    });
    
    if (!respuestaBlynk.ok) {
      throw new Error(`Blynk Cloud rechazó la solicitud. Código: ${respuestaBlynk.status}`);
    }

    const todosLosPines = await respuestaBlynk.json();
    
    // Imprime en la consola de tu terminal el JSON real que envía Blynk para que puedas auditarlo
    console.log("[API DEBUG] JSON crudo recibido desde Blynk:", todosLosPines);

    /**
     * BLINDAJE DE SEGURIDAD (Case Insensitive):
     * Mapeamos las respuestas evaluando tanto variables en mayúscula como en minúscula,
     * garantizando que el frontend jamás reciba un valor indefinido.
     */
    const temperatura = todosLosPines.V0 !== undefined ? String(todosLosPines.V0) : 
                        (todosLosPines.v0 !== undefined ? String(todosLosPines.v0) : "--.-");
                        
    const humedad =     todosLosPines.V1 !== undefined ? String(todosLosPines.V1) : 
                        (todosLosPines.v1 !== undefined ? String(todosLosPines.v1) : "--.-");
                        
    const modo =        todosLosPines.V2 !== undefined ? String(todosLosPines.V2) : 
                        (todosLosPines.v2 !== undefined ? String(todosLosPines.v2) : "unknown");

    // Enviamos el payload corregido y limpio hacia los componentes de shadcn/ui
    return NextResponse.json({ temperatura, humedad, modo });

  } catch (error: any) {
    console.error("[SERVIDOR NEXT.JS] Error crítico en el Bridge:", error.message);
    return NextResponse.json(
      { error: "Fallo al procesar el paquete binario de Blynk", detalle: error.message }, 
      { status: 500 }
    );
  }
}
