import { useState, useEffect } from "react";
import Head from "next/head";
import { BrowserWallet, Transaction, BlockfrostProvider, ForgeScript } from "@meshsdk/core";
import { MeshBadge } from "@meshsdk/react";
import Confetti from "react-confetti";

interface Product {
  id: number;
  name: string;
  price: number; // in ADA
  image: string;
  category: "watch" | "dress";
  description: string;
  seller: string;
}

// Cart item interface
interface CartItem extends Product {
  quantity: number;
}

// Fixed seller configuration
const SELLER_ADDRESS = "addr_test1qzf3x83p9v60kj2ml55eufcr24lfhe74u9pq2wudq34a4ktvdty7ly5lthcnwhhaz7sl3vn7v2dc6peyxwltnzskvghsznwxg0";
const SELLER_NAME = "Premium Marketplace";

// Blockfrost configuration (testnet)
const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "preprodk8WqHyFkGJxnpQxkWOX9z7l3zGL7BF4H";

// Sample products (5 items as requested)
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Luxury Gold Watch",
    price: 50, // Reduced prices for testnet
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%23FFD700'%3E%3Ccircle cx='150' cy='150' r='140' stroke='%23B8860B' stroke-width='10'/%3E%3Ccircle cx='150' cy='150' r='10' fill='%23000'/%3E%3Cline x1='150' y1='150' x2='150' y2='70' stroke='%23000' stroke-width='4'/%3E%3Cline x1='150' y1='150' x2='210' y2='150' stroke='%23000' stroke-width='2'/%3E%3Ctext x='150' y='280' text-anchor='middle' fill='%23B8860B' font-size='16'%3ELuxury Gold%3C/text%3E%3C/svg%3E",
    category: "watch",
    description: "Premium 18k gold plated watch with automatic movement and sapphire crystal display",
    seller: SELLER_NAME
  },
  {
    id: 2,
    name: "Elegant Evening Dress",
    price: 30,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23800080'%3E%3Cpath d='M100 50 L200 50 L220 150 L200 350 L100 350 L80 150 Z' fill='%23800080'/%3E%3Ccircle cx='150' cy='60' r='20' fill='%23FFC0CB'/%3E%3Ctext x='150' y='380' text-anchor='middle' fill='%23800080' font-size='14'%3EEvening Dress%3C/text%3E%3C/svg%3E",
    category: "dress",
    description: "Stunning purple evening dress perfect for special occasions and formal events",
    seller: SELLER_NAME
  },
  {
    id: 3,
    name: "Diamond Sports Watch",
    price: 75,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%23C0C0C0'%3E%3Ccircle cx='150' cy='150' r='140' stroke='%23808080' stroke-width='12'/%3E%3Ccircle cx='150' cy='150' r='8' fill='%23000'/%3E%3Cline x1='150' y1='150' x2='150' y2='80' stroke='%23000' stroke-width='3'/%3E%3Cline x1='150' y1='150' x2='200' y2='150' stroke='%23000' stroke-width='2'/%3E%3Ccircle cx='120' cy='100' r='3' fill='%23FFF'/%3E%3Ccircle cx='180' cy='100' r='3' fill='%23FFF'/%3E%3Ctext x='150' y='280' text-anchor='middle' fill='%23808080' font-size='14'%3EDiamond Sports%3C/text%3E%3C/svg%3E",
    category: "watch",
    description: "Professional sports watch with diamond markers and titanium construction",
    seller: SELLER_NAME
  },
  {
    id: 4,
    name: "Designer Cocktail Dress",
    price: 45,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23000000'%3E%3Cpath d='M110 50 L190 50 L200 120 L190 320 L110 320 L100 120 Z' fill='%23000000'/%3E%3Ccircle cx='150' cy='60' r='15' fill='%23FFC0CB'/%3E%3Ccircle cx='130' cy='100' r='5' fill='%23FFD700'/%3E%3Ccircle cx='170' cy='100' r='5' fill='%23FFD700'/%3E%3Ctext x='150' y='360' text-anchor='middle' fill='%23000' font-size='14'%3ECocktail Dress%3C/text%3E%3C/svg%3E",
    category: "dress",
    description: "Chic black cocktail dress with gold accents, perfect for parties and events",
    seller: SELLER_NAME
  },
  {
    id: 5,
    name: "Vintage Chronograph",
    price: 65,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%23DEB887'%3E%3Ccircle cx='150' cy='150' r='140' stroke='%238B4513' stroke-width='8'/%3E%3Ccircle cx='150' cy='150' r='12' fill='%23000'/%3E%3Cline x1='150' y1='150' x2='150' y2='90' stroke='%23000' stroke-width='4'/%3E%3Cline x1='150' y1='150' x2='190' y2='150' stroke='%23000' stroke-width='3'/%3E%3Ccircle cx='130' cy='120' r='15' fill='none' stroke='%23000' stroke-width='2'/%3E%3Ccircle cx='170' cy='180' r='15' fill='none' stroke='%23000' stroke-width='2'/%3E%3Ctext x='150' y='280' text-anchor='middle' fill='%238B4513' font-size='12'%3EVintage Chrono%3C/text%3E%3C/svg%3E",
    category: "watch",
    description: "Classic vintage chronograph with brown leather strap and mechanical movement",
    seller: SELLER_NAME
  }
];

export default function Home() {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Set up window size for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const connectWallet = async () => {
    try {
      console.log("🔍 Searching for available wallets...");
      const availableWallets = BrowserWallet.getInstalledWallets();
      console.log("📋 Found wallets:", availableWallets.map(w => w.name));

      if (availableWallets.length === 0) {
        alert("No Cardano wallets found. Please install Yoroi, Nami, or another Cardano wallet extension.");
        return;
      }

      // Try to connect to Yoroi first, then fallback to any available wallet
      let walletToConnect = availableWallets.find(w => w.name.toLowerCase().includes('yoroi'));
      if (!walletToConnect) {
        walletToConnect = availableWallets[0];
      }

      console.log(`🔗 Attempting to connect to: ${walletToConnect.name}`);
      const walletInstance = await BrowserWallet.enable(walletToConnect.name);
      setWallet(walletInstance);
      console.log("✅ Wallet instance created successfully");

      // Get wallet address with multiple fallback methods
      let address = "";
      try {
        console.log("📍 Attempting to get wallet address...");
        
        // Method 1: Try getUsedAddresses first
        const usedAddresses = await walletInstance.getUsedAddresses();
        if (usedAddresses && usedAddresses.length > 0) {
          address = usedAddresses[0];
          console.log("✅ Got address from getUsedAddresses:", address);
        } else {
          console.log("⚠️ No used addresses, trying getUnusedAddresses...");
          
          // Method 2: Try getUnusedAddresses
          const unusedAddresses = await walletInstance.getUnusedAddresses();
          if (unusedAddresses && unusedAddresses.length > 0) {
            address = unusedAddresses[0];
            console.log("✅ Got address from getUnusedAddresses:", address);
          } else {
            console.log("⚠️ No unused addresses, trying getChangeAddress...");
            
            // Method 3: Try getChangeAddress
            const changeAddress = await walletInstance.getChangeAddress();
            if (changeAddress) {
              address = changeAddress;
              console.log("✅ Got address from getChangeAddress:", address);
            } else {
              console.log("❌ All address methods failed");
            }
          }
        }

        // Final check - if we still don't have an address, try to get ANY address
        if (!address) {
          console.log("🔄 Making final attempt to get address...");
          try {
            const allAddresses = await walletInstance.getUsedAddresses();
            if (allAddresses && allAddresses.length > 0) {
              address = allAddresses[0];
              console.log("✅ Final attempt successful:", address);
            } else {
              const changeAddr = await walletInstance.getChangeAddress();
              if (changeAddr) {
                address = changeAddr;
                console.log("✅ Using change address:", address);
              } else {
                console.log("❌ No addresses found by any method");
              }
            }
          }
          }
        }
      } catch (addrError) {
        console.error("❌ Could not retrieve wallet address:", addrError);
        address = "Address retrieval failed";
      }
      
      setWalletAddress(address);
      console.log("💾 Wallet address saved to state:", address);
      
      // Console log the wallet address
      console.log("🎉 Wallet connected successfully!");
      console.log("👤 Connected wallet address:", address);
      console.log("🏪 Fixed seller address:", SELLER_ADDRESS);
      console.log("📱 All available wallets:", availableWallets.map(w => w.name));
      
      alert("Wallet connected ✅");
    } catch (err) {
      console.error("❌ Wallet connection error:", err);
      console.error("🔍 Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      alert("Wallet connection failed. Please make sure your wallet is unlocked and try again.");
    }
  };

  const processPurchase = async () => {
    console.log("🚀 Starting purchase process...");

    if (!wallet) return alert("Please connect your wallet first!");
    if (cart.length === 0) return alert("Your cart is empty!");

    setIsLoading(true);
    try {
      const total = getTotalPrice();
      const buyerAddresses = await wallet.getUsedAddresses();
      if (!buyerAddresses || buyerAddresses.length === 0)
        throw new Error("No addresses found in wallet");
      const buyerAddress = buyerAddresses[0];

      console.log("💰 Sending ADA payment...");
      const tx = new Transaction({ initiator: wallet });
      const lovelaces = (total * 1_000_000).toString();
      tx.sendLovelace(SELLER_ADDRESS, lovelaces);

      console.log("🎨 Preparing NFT minting...");
      
      // Create forge script for NFT minting
      const forgeScript = ForgeScript.withOneSignature(buyerAddress);
      
      // Prepare metadata for all NFTs
      const allNftMetadata: { [key: string]: any } = {};
      
      for (const item of cart) {
        const assetName = `AIArt${Date.now()}_${item.id}`;
        
        // Add this NFT's metadata to the collection (keeping within 64-byte limits)
        allNftMetadata[assetName] = {
          name: item.name.substring(0, 30), // Max 30 chars for name
          image: `ipfs://QmNft${item.id}Hash`, // Short placeholder IPFS hash
          desc: item.description.substring(0, 40), // Max 40 chars, use 'desc' not 'description'
          artist: "AI Market", // Shortened
          type: "Art"
        };
        
        // Mint NFT for each quantity
        for (let i = 0; i < item.quantity; i++) {
          tx.mintAsset(
            forgeScript,
            {
              assetName: `${assetName}_${i}`,
              assetQuantity: "1",
            }
          );
        }
      }
      
      // Attach metadata (simplified approach)
      if (Object.keys(allNftMetadata).length > 0) {
        tx.setMetadata(721, allNftMetadata);
      }

      console.log("🔨 Building transaction...");
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      console.log("🎉 Transaction complete! TX Hash:", txHash);
      console.log("🎨 NFT Transaction Hash:", txHash);
      console.log("🔗 View on Cardanoscan:", `https://preprod.cardanoscan.io/transaction/${txHash}`);
      console.log("📦 NFT Assets minted:", Object.keys(allNftMetadata));
      console.log("🏷️ NFT Metadata:", allNftMetadata);
      
      // Log policy ID and asset names for tracking
      console.log("🔑 Policy ID will be generated by the transaction");
      console.log("🎯 NFT Asset Names minted:");
      Object.keys(allNftMetadata).forEach(assetName => {
        console.log(`   Asset: ${assetName}`);
      });
      
      console.log("💡 To find your NFT:");
      console.log("1. Check transaction on: https://preprod.cardanoscan.io/transaction/" + txHash);
      console.log("2. Look for 'Native Tokens' or 'Assets' section in the transaction");
      console.log("3. In your wallet, refresh and look for new tokens/NFTs");
      console.log("4. Asset names start with: AIArt[timestamp]");
      console.log("5. If not visible, try: Wallet Settings > Show/Hide Assets > Enable all assets");

      // Confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      alert(`🎉 Payment Successful! NFTs minted for your products.\nTransaction Hash: ${txHash}`);
      
      // Clear cart
      setCart([]);
      setShowCart(false);
    } catch (err) {
      console.error("❌ Purchase error:", err);
      alert(`Payment/NFT minting failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen text-gray-800">
      <Head>
        <title>Premium AI Art Marketplace - NFT Collection with Cardano</title>
        <meta name="description" content="Discover and purchase exclusive AI-generated art NFTs with secure Cardano ADA payments" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-xl border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🎨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Art Marketplace
                </h1>
                <p className="text-sm text-gray-500 font-medium">Premium NFT Collection by {SELLER_NAME}</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl relative hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                <span className="flex items-center space-x-2">
                  <span>🛒</span>
                  <span>Cart ({cart.length})</span>
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              
              {/* Wallet Connect */}
              <button
                onClick={connectWallet}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  wallet 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{wallet ? "✅" : "🔗"}</span>
                  <span>{wallet ? "Wallet Connected" : "Connect Wallet"}</span>
                </span>
              </button>
            </nav>
          </div>

          {/* Seller Info Bar */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-4 py-3 border border-blue-200">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-semibold">💳 Secure Payments to:</span>
                <code className="bg-white px-3 py-1 rounded-md text-xs font-mono border border-blue-200 text-blue-800">
                  {SELLER_ADDRESS.slice(0, 20)}...{SELLER_ADDRESS.slice(-8)}
                </code>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-600 font-semibold">🌐 Cardano Testnet</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Discover Premium AI Art NFTs
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Own unique, blockchain-verified digital art pieces. Each purchase includes both the luxury item and an exclusive NFT certificate of authenticity.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <span>AI-Generated Art</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔒</span>
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💎</span>
              <span>Exclusive Collection</span>
            </div>
          </div>
        </div>

        {/* Wallet Address Display */}
        {walletAddress && (
          <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-800">Wallet Connected</h3>
            </div>
            <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-50 p-3 rounded-lg border">
              {walletAddress}
            </p>
          </div>
        )}

        {/* Shopping Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                <button 
                  onClick={() => setShowCart(false)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-6xl">🛒</span>
                  <p className="text-gray-500 mt-4">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-semibold text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₳{item.price}</p>
                            <p className="text-sm font-semibold text-green-600">₳{item.quantity * item.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-gray-800">Total: ₳{getTotalPrice()}</span>
                    </div>
                    <button
                      onClick={processPurchase}
                      disabled={!wallet || isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span className="animate-spin">🔄</span>
                          <span>Processing Payment...</span>
                        </span>
                      ) : wallet ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span>💳</span>
                          <span>Pay ₳{getTotalPrice()} & Mint NFTs</span>
                        </span>
                      ) : (
                        "Connect Wallet to Pay"
                      )}
                    </button>
                    {wallet && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Payment will be sent to seller's address + NFTs minted to your wallet
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Product Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                    product.category === 'watch' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-600'
                  }`}>
                    {product.category === 'watch' ? '⌚ Watch' : '👗 Dress'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>🏪</span>
                    <span>{product.seller}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                      ₳{product.price}
                    </span>
                    <p className="text-xs text-gray-500">+ NFT Certificate</p>
                  </div>
                </div>
                
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🛒</span>
                    <span>Add to Cart</span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose Our Marketplace?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Blockchain Security</h4>
              <p className="text-gray-600 text-sm">All transactions secured by Cardano's proof-of-stake blockchain technology</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="text-4xl mb-4">💸</div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Direct Payments</h4>
              <p className="text-gray-600 text-sm">Funds go directly to seller's wallet with no intermediaries</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">NFT Ownership</h4>
              <p className="text-gray-600 text-sm">Receive unique NFT certificates proving authentic ownership</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4">
            <MeshBadge isDark={false} />
          </div>
          <p className="text-gray-500 mb-2">Powered by Cardano & MeshSDK</p>
          <p className="text-xs text-gray-400">
            Testnet Environment • All transactions are for demonstration purposes
          </p>
        </div>
      </footer>
    </div>
  );
}