import { useState, useEffect, useMemo } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

const TU_WALLET = "EtvgSGvoWcVV17eRwbHpW21FDpACLuSTH5Mm47CYpg6d";
const RPC = "https://mainnet.helius-rpc.com/?api-key=b65edef5-4e26-4807-a8e7-65ebb6cc184a";
const COLAB_URL = "https://overattentive-susanne-marbly.ngrok-free.dev";

function VideoApp() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [hardware, setHardware] = useState(null);
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

  const pagar = async () => {
    try {
      const connection = new Connection(RPC);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TU_WALLET),
          lamports: LAMPORTS_PER_SOL * 0.01,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
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
      const response = await fetch(`${COLAB_URL}/generar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ prompt }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideo(url);
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
      <WalletMultiButton />
      <br /><br />
      {connected && !pagado && (
        <div>
          <p style={{ color: "#666", fontSize: 13 }}>
            Acceso completo por $1.50 cada 3 días
          </p>
          <button onClick={pagar}
            style={{ background: "#222", color: "white", border: "1px solid #444",
              padding: "10px 20px", cursor: "pointer", fontFamily: "monospace" }}>
            Pagar y generar videos
          </button>
        </div>
      )}
      {connected && pagado && (
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

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <VideoApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}