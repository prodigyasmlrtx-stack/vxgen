import { useState, useEffect, useRef } from "react";
import { pipeline } from "@xenova/transformers";

function App() {
  const [hardware, setHardware] = useState(null);
  const [modelo, setModelo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imagen, setImagen] = useState(null);
  const modeloRef = useRef(null);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 1;
    let tier, resolucion, duracion;
    if (cores >= 8 && memory >= 8) {
      tier = "alto"; resolucion = "1080p"; duracion = 10;
    } else if (cores >= 4 && memory >= 4) {
      tier = "medio"; resolucion = "720p"; duracion = 7;
    } else {
      tier = "basico"; resolucion = "480p"; duracion = 5;
    }
    setHardware({ tier, resolucion, duracion, cores, memory });
  }, []);

  const cargarModelo = async () => {
    setCargando(true);
    try {
      const pipe = await pipeline(
        "text-to-image",
        "Xenova/stable-diffusion-v1-5"
      );
      modeloRef.current = pipe;
      setModelo(true);
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
    setCargando(false);
  };

  const generar = async () => {
    if (!modeloRef.current || !prompt) return;
    setCargando(true);
    setImagen(null);
    try {
      const output = await modeloRef.current(prompt);
      const url = URL.createObjectURL(output);
      setImagen(url);
    } catch (error) {
      alert("Error: " + error.message);
    }
    setCargando(false);
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh",
      color: "white", fontFamily: "monospace", padding: 40 }}>
      <h1>VXGEN</h1>
      {hardware && (
        <p style={{ color: "#888" }}>
          {hardware.tier} | {hardware.resolucion} | {hardware.duracion}s
        </p>
      )}
      <br />
      <button onClick={cargarModelo} disabled={cargando || modelo}
        style={{ background: "#222", color: "white", border: "1px solid #444",
          padding: "10px 20px", cursor: "pointer", fontFamily: "monospace",
          marginBottom: 20 }}>
        {modelo ? "✅ Modelo listo" : cargando ? "Cargando modelo..." : "Cargar modelo IA"}
      </button>
      <br />
      <input value={prompt} onChange={e => setPrompt(e.target.value)}
        placeholder="Describe tu imagen..."
        style={{ background: "#111", color: "white", border: "1px solid #333",
          padding: "10px", width: 400, fontFamily: "monospace" }} />
      <br /><br />
      <button onClick={generar} disabled={!modelo || cargando || !prompt}
        style={{ background: "#222", color: "white", border: "1px solid #444",
          padding: "10px 20px", cursor: "pointer", fontFamily: "monospace" }}>
        {cargando ? "Generando..." : "Generar imagen"}
      </button>
      {imagen && (
        <div style={{ marginTop: 20 }}>
          <img src={imagen} alt="generada"
            style={{ maxWidth: 512, borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

export default App;