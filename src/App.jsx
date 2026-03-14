import { useState, useEffect, useRef } from "react";
import { pipeline } from "@xenova/transformers";

function App() {
  const [hardware, setHardware] = useState(null);
  const [modelo, setModelo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [resultado, setResultado] = useState(null);
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
        "text2text-generation",
        "Xenova/LaMini-Flan-T5-77M"
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
    try {
      const output = await modeloRef.current(prompt, { max_new_tokens: 50 });
      setResultado(output[0]?.generated_text || JSON.stringify(output));
    } catch (error) {
      setResultado("Error: " + error.message);
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
        placeholder="Describe tu video..."
        style={{ background: "#111", color: "white", border: "1px solid #333",
          padding: "10px", width: 400, fontFamily: "monospace" }} />
      <br /><br />
      <button onClick={generar} disabled={!modelo || cargando || !prompt}
        style={{ background: "#222", color: "white", border: "1px solid #444",
          padding: "10px 20px", cursor: "pointer", fontFamily: "monospace" }}>
        {cargando ? "Generando..." : "Generar"}
      </button>
      {resultado && (
        <div style={{ marginTop: 20, padding: 20,
          background: "#111", border: "1px solid #333" }}>
          <p>{resultado}</p>
        </div>
      )}
    </div>
  );
}

export default App;