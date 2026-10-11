"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [temperatura, setTemperatura] = useState<string>("--.-");
  const [humedad, setHumedad] = useState<string>("--.-");
  const [modo, setModo] = useState<string>("Cargando...");
  const [badgeVariant, setBadgeVariant] = useState<"default" | "secondary" | "destructive">("secondary");
  const [lastUpdate, setLastUpdate] = useState<string>("Nunca sincronizado");

  useEffect(() => {
    const obtenerDatosIoT = async () => {
      try {
        // Consultamos a nuestro propio servidor interno de Next.js
        const respuesta = await fetch("/api/blynk");
        if (!respuesta.ok) throw new Error("Error en la respuesta de la API interna");
        
        const datos = await respuesta.json();

        if (datos.error) throw new Error(datos.error);

        // Formateo de los datos recibidos
        const tVal = datos.temperatura !== "--.-" ? parseFloat(datos.temperatura).toFixed(1) + " °C" : "--.-";
        const hVal = datos.humedad !== "--.-" ? parseFloat(datos.humedad).toFixed(1) + " %" : "--.-";
        
        let mVal = "Desconocido";
        if (datos.modo === "auto") {
          mVal = "AUTOMÁTICO 🤖";
          setBadgeVariant("default"); 
        } else if (datos.modo === "manual_on") {
          mVal = "ENCENDIDO MANUAL 🟢";
          setBadgeVariant("secondary"); 
        } else if (datos.modo === "manual_off") {
          mVal = "APAGADO MANUAL 🔴";
          setBadgeVariant("destructive"); 
        }

        setTemperatura(tVal);
        setHumedad(hVal);
        setModo(mVal);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error consultando la API interna:", error);
        setLastUpdate("Error de sincronización local.");
      }
    };

    obtenerDatosIoT();

    // Loop pasivo de 15 segundos obligado por el plan gratuito de Blynk
    const interval = setInterval(obtenerDatosIoT, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Proyecto para UCIP
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            Panel de Control IoT: habitacion brian
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          {/*<div className="text-sm font-medium text-slate-500">
            Estado de Operación de la ESP32:
          </div>
          
          <Badge variant={badgeVariant} className="text-sm px-4 py-1.5 font-bold shadow-sm">
            {modo}
          </Badge>*/}
        </div>

        <footer className="text-xs text-slate-400 space-y-1">
          <div>Última actualización: <span className="font-medium text-slate-500">{lastUpdate}</span></div>
          {/*<div className="opacity-70 font-mono text-[10px]">Next.js API Secure Server Bridge Enabled</div>*/}
        </footer>

      </div>
    </main>
  );
}
