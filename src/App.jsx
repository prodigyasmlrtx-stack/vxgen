import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

const TU_WALLET = "EtvgSGvoWcVV17eRwbHpW21FDpACLuSTH5Mm47CYpg6d";
const RPC = "https://mainnet.helius-rpc.com/?api-key=b65edef5-4e26-4807-a8e7-65ebb6cc184a";

function App() {
  const [hardware, setHardware] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [pagado, setPagado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [video, setVideo] = useState(null);

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
    setHardware({ tier, resolucion, duracion });
  }, []);

  const conectarWallet = async () => {
    try {
      const { solana } = window;
      if (!solana?.isPhantom) {
        alert("Instala Phantom Wallet primero desde phantom.app");
        return;
      }
      const response = await solana.connect();
      setWallet(response.publicKey.toString());
    } catch (error) {
      alert("Error conectando wallet: " + error.message);
    }
  };

  const pagar = async () => {
    try {
      const { solana } = window;
      const connection = new Connection(RPC);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet),
          toPubkey: new PublicKey(TU_WALLET),
          lamports: LAMPORTS_PER_SOL * 0.01,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet);
      const signed = await solana.signAndSendTransaction(transaction);
      console.log("TX:", signed.signature);
      setPagado(true);
    } catch (error) {
      alert("Error en pago: " + error.message);
    }
  };

  const generar = async () => {
    if (!prompt) return;
    setCargando(true);
    setVideo(null);
    try {
      const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/text-to-video", {
        input: {
          prompt: prompt,
          duration: hardware?.duracion >= 10 ? "10" : "5",
          aspect_ratio: "9:16",
        },
      });
      setVideo(result.data.video.url);
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
      {!wallet ? (
        <button onClick={conectarWallet}
          style={{ background: "#222", color: "white", border: "1px solid #444",
            padding: "10px 20px", cursor: "pointer", fontFamily: "monospace" }}>
          Conectar Phantom Wallet
        </button>
      ) : !pagado ? (
        <div>
          <p style={{ color: "#888" }}>
            Wallet: {wallet.slice(0,8)}...{wallet.slice(-4)}
          </p>
          <p style={{ color: "#666", fontSize: 13 }}>
            Acceso completo por $1.50 cada 3 días
          </p>
          <button onClick={pagar}
            style={{ background: "#222", color: "white", border: "1px solid #444",
              padding: "10px 20px", cursor: "pointer", fontFamily: "monospace" }}>
            Pagar y generar videos
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: "#00ff95" }}>✅ Acceso activo</p>
          <input value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe tu video..."
            style={{ background: "#111", color: "white", border: "1px solid #333",
              padding: "10px", width: 400, fontFamily: "monospace" }} />
          <br /><br />
          <button onClick={generar} disabled={cargando || !prompt}
            style={{ background: "#222", color: "white", border: "1px solid #444",
              padding: "10px 20px", cursor: "pointer", fontFamily: "monospace" }}>
            {cargando ? "Generando video..." : "Generar video"}
          </button>
          {video && (
            <div style={{ marginTop: 20 }}>
              <video src={video} controls autoPlay
                style={{ maxWidth: 400, borderRadius: 8 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;