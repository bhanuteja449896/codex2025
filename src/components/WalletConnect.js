import { useState } from "react";
import { Wallet } from "@meshsdk/core";

export default function WalletConnect({ setWallet }) {
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const wallet = new Wallet({ name: "yoroi" }); // You can also use Flint
      await wallet.enable(); // opens wallet popup
      setWallet(wallet);
      setConnected(true);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  return (
    <div>
      {connected ? (
        <p>Wallet Connected ✅</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
