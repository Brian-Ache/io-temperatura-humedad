"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function Home() {
  const [temperatura, setTemperatura] = useState<string>("--.-");
  const [humedad, setHumedad] = useState<string>("--.-");
  const [lastUpdate, setLastUpdate] = useState<string>("Nunca sincronizado");
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    const obtenerDatosIoT = async () => {
      try {
        const respuesta = await fetch("/api/blynk");
        if (!respuesta.ok) throw new Error("Error en la respuesta de la API interna");
        
        const datos = await respuesta.json();

        if (datos.error) throw new Error(datos.error);

        // Si el puente detecta que la placa se apagó
        if (datos.offline) {
          setIsOffline(true);
          setTemperatura("--.-");
          setHumedad("--.-");
          setLastUpdate("Desconectado");
        } else {
          // Si la placa está encendida, mapeamos los floats con normalidad
          setIsOffline(false);
          const tVal = datos.temperatura !== "--.-" ? parseFloat(datos.temperatura).toFixed(1) + " °C" : "--.-";
          const hVal = datos.humedad !== "--.-" ? parseFloat(datos.humedad).toFixed(1) + " %" : "--.-";
          
          setTemperatura(tVal);
          setHumedad(hVal);
          setLastUpdate(new Date().toLocaleTimeString());
        }

      } catch (error) {
        console.error("Error consultando la API interna:", error);
        setLastUpdate("Error de sincronización local.");
      }
    };

    obtenerDatosIoT();

    // Consulta automática regulada cada 15 segundos
    const interval = setInterval(obtenerDatosIoT, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Encabezado UCIP */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Proyecto para UCIP
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            Panel de Control IoT: habitacion brian
          </p>
        </div>

        {/* Mapeo de Tarjetas Shadcn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Tarjeta Temperatura */}
          <Card className="shadow-sm border-slate-200/60 overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Temperatura Ambiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-4xl md:text-5xl font-black tracking-tight text-rose-500">
                {temperatura}
              </span>
            </CardContent>
          </Card>

          {/* Tarjeta Humedad */}
          <Card className="shadow-sm border-slate-200/60 overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Humedad Relativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-4xl md:text-5xl font-black tracking-tight text-blue-500">
                {humedad}
              </span>
            </CardContent>
          </Card>
          
        </div>

        {/* Pie de Página Dinámico */}
        <footer className="text-xs text-slate-400 space-y-1">
          <div>
            Sincronización:{" "}
            <span className={`font-semibold ${isOffline ? "text-red-500 font-bold" : "text-slate-500"}`}>
              {lastUpdate}
            </span>
          </div>
        </footer>

      </div>
    </main>
  );
}
