import { useState, useEffect } from "react";
import Head from "next/head";
import { BrowserWallet, Transaction, BlockfrostProvider } from "@meshsdk/core";
import { MeshBadge } from "@meshsdk/react";
import Confetti from "react-confetti";

// Product interface
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
    description: "Premium 18k gold plated watch with automatic movement",
    seller: SELLER_NAME
  },
  {
    id: 2,
    name: "Elegant Evening Dress",
    price: 30,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23800080'%3E%3Cpath d='M100 50 L200 50 L220 150 L200 350 L100 350 L80 150 Z' fill='%23800080'/%3E%3Ccircle cx='150' cy='60' r='20' fill='%23FFC0CB'/%3E%3Ctext x='150' y='380' text-anchor='middle' fill='%23800080' font-size='14'%3EEvening Dress%3C/text%3E%3C/svg%3E",
    category: "dress",
    description: "Stunning purple evening dress perfect for special occasions",
    seller: SELLER_NAME
  },
  {
    id: 3,
    name: "Sport Chronograph",
    price: 35,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%23000'%3E%3Ccircle cx='150' cy='150' r='140' stroke='%23333' stroke-width='10'/%3E%3Ccircle cx='150' cy='150' r='8' fill='%23FF0000'/%3E%3Cline x1='150' y1='150' x2='150' y2='80' stroke='%23FF0000' stroke-width='3'/%3E%3Cline x1='150' y1='150' x2='200' y2='150' stroke='%23FF0000' stroke-width='2'/%3E%3Ccircle cx='120' cy='100' r='20' fill='none' stroke='%23333' stroke-width='2'/%3E%3Ccircle cx='180' cy='100' r='20' fill='none' stroke='%23333' stroke-width='2'/%3E%3Ctext x='150' y='280' text-anchor='middle' fill='%23333' font-size='14'%3ESport Chrono%3C/text%3E%3C/svg%3E",
    category: "watch",
    description: "Professional sport chronograph with water resistance",
    seller: SELLER_NAME
  },
  {
    id: 4,
    name: "Summer Floral Dress",
    price: 20,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23FF69B4'%3E%3Cpath d='M110 50 L190 50 L200 150 L190 350 L110 350 L100 150 Z' fill='%23FF69B4'/%3E%3Ccircle cx='150' cy='60' r='15' fill='%23FFC0CB'/%3E%3Ccircle cx='130' cy='120' r='8' fill='%23FFFF00'/%3E%3Ccircle cx='170' cy='140' r='8' fill='%23FFFF00'/%3E%3Ccircle cx='140' cy='180' r='6' fill='%23FF0000'/%3E%3Ccircle cx='160' cy='200' r='6' fill='%23FF0000'/%3E%3Ctext x='150' y='380' text-anchor='middle' fill='%23FF69B4' font-size='14'%3EFloral Dress%3C/text%3E%3C/svg%3E",
    category: "dress",
    description: "Light and breezy summer dress with floral pattern",
    seller: SELLER_NAME
  },
  {
    id: 5,
    name: "Classic Leather Watch",
    price: 25,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%238B4513'%3E%3Ccircle cx='150' cy='150' r='130' stroke='%23654321' stroke-width='8'/%3E%3Ccircle cx='150' cy='150' r='6' fill='%23000'/%3E%3Cline x1='150' y1='150' x2='150' y2='90' stroke='%23000' stroke-width='3'/%3E%3Cline x1='150' y1='150' x2='190' y2='150' stroke='%23000' stroke-width='2'/%3E%3Crect x='120' y='260' width='60' height='15' fill='%238B4513'/%3E%3Crect x='120' y='25' width='60' height='15' fill='%238B4513'/%3E%3Ctext x='150' y='290' text-anchor='middle' fill='%23654321' font-size='14'%3ELeather Classic%3C/text%3E%3C/svg%3E",
    category: "watch",
    description: "Timeless leather strap watch with Roman numerals",
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

  // Initialize Blockfrost provider
  const blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);

  // Get window size for confetti
  useEffect(() => {
    function updateSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Add item to cart
  const addToCart = (product: Product) => {
    console.log("🛒 Adding item to cart:", product.name);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        console.log("📦 Item already in cart, incrementing quantity:", existingItem.quantity + 1);
        const newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log("🛒 Updated cart:", newCart);
        return newCart;
      } else {
        console.log("🆕 New item added to cart");
        const newCart = [...prevCart, { ...product, quantity: 1 }];
        console.log("🛒 Updated cart:", newCart);
        return newCart;
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    console.log("🗑️ Removing item from cart, ID:", productId);
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      console.log("🛒 Cart after removal:", newCart);
      return newCart;
    });
  };

  // Calculate total price
  const getTotalPrice = () => {
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log("💰 Cart total calculated:", total, "ADA for", cart.length, "unique items");
    return total;
  };

  // Connect Wallet
  const connectWallet = async () => {
    console.log("🔗 Starting wallet connection process...");
    
    try {
      console.log("🔍 Detecting installed wallets...");
      const availableWallets = BrowserWallet.getInstalledWallets();
      console.log("📱 Available wallets found:", availableWallets.map(w => w.name));
      
      if (availableWallets.length === 0) {
        console.log("❌ No wallets detected");
        alert("No Cardano wallets found. Install Yoroi, Nami, Eternl, or Flint.");
        return;
      }

      // Find Yoroi wallet specifically, or use the first available
      let selectedWallet = availableWallets[0];
      const yoroiWallet = availableWallets.find(w => w.name.toLowerCase().includes('yoroi'));
      if (yoroiWallet) {
        selectedWallet = yoroiWallet;
        console.log("✅ Yoroi wallet found, using Yoroi:", yoroiWallet);
      } else {
        console.log("⚠️  Yoroi not found, using first available:", selectedWallet);
      }

      console.log("🔌 Attempting to connect to:", selectedWallet.name);
      const w = await BrowserWallet.enable(selectedWallet.name);
      console.log("✅ Wallet enabled successfully");
      setWallet(w);

      // Get wallet addresses - try multiple methods
      console.log("📍 Retrieving wallet addresses...");
      let address = "Address not available";
      try {
        console.log("🔍 Trying getUsedAddresses()...");
        const usedAddresses = await w.getUsedAddresses();
        console.log("📋 Used addresses:", usedAddresses);
        
        if (usedAddresses && usedAddresses.length > 0) {
          address = usedAddresses[0];
          console.log("✅ Using first used address:", address);
        } else {
          console.log("⚠️  No used addresses, trying getUnusedAddresses()...");
          // Try getting unused addresses if used addresses are empty
          const unusedAddresses = await w.getUnusedAddresses();
          console.log("📋 Unused addresses:", unusedAddresses);
          
          if (unusedAddresses && unusedAddresses.length > 0) {
            address = unusedAddresses[0];
            console.log("✅ Using first unused address:", address);
          } else {
            console.log("⚠️  No unused addresses, trying getChangeAddress()...");
            // Try getting change address
            const changeAddress = await w.getChangeAddress();
            console.log("📋 Change address:", changeAddress);
            
            if (changeAddress) {
              address = changeAddress;
              console.log("✅ Using change address:", address);
            } else {
              console.log("❌ No addresses found by any method");
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
  };  // Process purchase with real ADA transfer using Blockfrost
  const processPurchase = async () => {
    console.log("🚀 Starting purchase process...");
    
    if (!wallet) {
      console.log("❌ No wallet connected");
      return alert("Please connect your wallet first!");
    }
    
    if (cart.length === 0) {
      console.log("❌ Cart is empty");
      return alert("Your cart is empty!");
    }

    setIsLoading(true);
    console.log("⏳ Setting loading state to true");
    
    try {
      const total = getTotalPrice();
      console.log("💰 Cart total calculated:", total, "ADA");
      
      const buyerAddresses = await wallet.getUsedAddresses();
      console.log("🏦 Buyer addresses retrieved:", buyerAddresses);
      
      if (!buyerAddresses || buyerAddresses.length === 0) {
        throw new Error("No addresses found in wallet");
      }
      
      const buyerAddress = buyerAddresses[0];
      console.log("👤 Using buyer address:", buyerAddress);
      console.log("🏪 Fixed seller address:", SELLER_ADDRESS);
      
      console.log("📦 Items being purchased:", cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })));
      
      // Create transaction to send ADA from buyer to seller
      console.log("🔨 Creating transaction object...");
      const tx = new Transaction({ initiator: wallet });
      console.log("✅ Transaction object created");
      
      // Convert ADA to Lovelaces (1 ADA = 1,000,000 Lovelaces)
      const lovelaces = (total * 1_000_000).toString();
      console.log("💱 Converting", total, "ADA to", lovelaces, "Lovelaces");
      
      // Send ADA to seller address
      console.log("💸 Adding payment to transaction:", lovelaces, "Lovelaces to", SELLER_ADDRESS);
      tx.sendLovelace(SELLER_ADDRESS, lovelaces);
      console.log("✅ Payment added to transaction");
      
      // Create shortened metadata to avoid 64-byte limit
      const itemsList = cart.map(item => `${item.name.slice(0, 10)} x${item.quantity}`).join(", ");
      const buyerShort = `${buyerAddress.slice(0, 15)}...${buyerAddress.slice(-8)}`;
      const sellerShort = `${SELLER_ADDRESS.slice(0, 15)}...${SELLER_ADDRESS.slice(-8)}`;
      const timestamp = new Date().toISOString().slice(0, 16); // Shorter timestamp
      
      console.log("📝 Creating metadata with shortened fields:");
      console.log("  - Items (shortened):", itemsList);
      console.log("  - Buyer (shortened):", buyerShort);
      console.log("  - Seller (shortened):", sellerShort);
      console.log("  - Timestamp:", timestamp);
      
      // Add metadata with shortened values to stay under 64-byte limit
      const metadata = {
        674: {
          msg: [
            "Marketplace Purchase",
            `Items: ${itemsList.slice(0, 50)}`, // Limit to 50 chars
            `Total: ${total} ADA`,
            `From: ${buyerShort}`,
            `To: ${sellerShort}`,
            `Time: ${timestamp}`
          ]
        }
      };
      
      console.log("📋 Final metadata object:", metadata);
      
      // Check metadata field lengths
      metadata[674].msg.forEach((field, index) => {
        console.log(`📏 Metadata field ${index} length:`, field.length, "chars -", field);
        if (field.length > 64) {
          console.warn("⚠️  Field exceeds 64 characters:", field);
        }
      });
      
      tx.setMetadata(674, metadata[674]);
      console.log("✅ Metadata added to transaction");
      
      console.log("🔨 Building transaction...");
      const unsignedTx = await tx.build();
      console.log("✅ Transaction built successfully");
      console.log("📄 Unsigned transaction:", unsignedTx);
      
      console.log("✍️  Requesting wallet signature...");
      const signedTx = await wallet.signTx(unsignedTx);
      console.log("✅ Transaction signed successfully");
      console.log("📄 Signed transaction:", signedTx);
      
      console.log("📡 Submitting transaction to blockchain...");
      const txHash = await wallet.submitTx(signedTx);
      console.log("🎉 Transaction submitted successfully!");
      console.log("🔗 Transaction Hash:", txHash);
      
      // Show success animation
      console.log("🎊 Starting confetti animation...");
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        console.log("🎊 Confetti animation stopped");
      }, 5000); // Stop confetti after 5 seconds
      
      console.log("✅ Payment process completed successfully");
      
      alert(`🎉 Payment Successful! 
✅ Total Paid: ${total} ADA
💳 Transaction Hash: ${txHash}
🏪 Seller: ${SELLER_NAME}
📦 Items will be shipped to your registered address.
🔗 Check transaction on Cardanoscan (testnet).`);
      
      // Clear cart after successful purchase
      setCart([]);
      setShowCart(false);
      console.log("🛒 Cart cleared after successful purchase");
      
    } catch (err) {
      console.error("❌ Purchase error occurred:", err);
      console.error("🔍 Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        name: err instanceof Error ? err.name : 'Unknown error type'
      });
      
      let errorMessage = "Payment failed. Please try again.";
      if (err instanceof Error) {
        console.log("🔍 Analyzing error message:", err.message);
        
        if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient ADA in your wallet. Please add more testnet funds.";
          console.log("💸 Error type: Insufficient funds");
        } else if (err.message.includes("rejected")) {
          errorMessage = "Transaction was rejected. Please check your wallet.";
          console.log("🚫 Error type: Transaction rejected");
        } else if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
          console.log("🌐 Error type: Network issue");
        } else if (err.message.includes("MAX_LENGTH_LIMIT")) {
          errorMessage = "Transaction metadata too long. This is a technical issue.";
          console.log("📏 Error type: Metadata length limit exceeded");
        } else if (err.message.includes("evaluate")) {
          errorMessage = "Transaction validation failed. Please try with a smaller amount.";
          console.log("⚠️  Error type: Transaction evaluation failed");
        } else {
          errorMessage = `Transaction failed: ${err.message}`;
          console.log("❓ Error type: Unknown -", err.message);
        }
      }
      
      console.log("🚨 Showing error message to user:", errorMessage);
      alert(`❌ ${errorMessage}`);
    } finally {
      console.log("🏁 Cleaning up - setting loading to false");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Head>
        <title>Premium Marketplace - Luxury Items with Cardano</title>
        <meta name="description" content="Buy luxury watches and fashion with Cardano ADA payments" />
      </Head>

      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-sky-400">🏪 Premium Marketplace</h1>
            <p className="text-sm text-gray-400">by {SELLER_NAME}</p>
          </div>
          
          <nav className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-green-600 px-4 py-2 rounded relative hover:bg-green-700 transition-colors"
            >
              🛒 Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            
            {/* Wallet Connect */}
            <button
              onClick={connectWallet}
              className="bg-sky-600 px-4 py-2 rounded hover:bg-sky-700 transition-colors"
            >
              {wallet ? "✅ Wallet Connected" : "� Connect Wallet"}
            </button>
          </nav>
        </div>

        {/* Seller Info Bar */}
        <div className="bg-sky-900 px-4 py-2">
          <div className="container mx-auto flex justify-between items-center text-sm">
            <span>💳 Payments go directly to: <code className="bg-gray-700 px-2 py-1 rounded text-xs">{SELLER_ADDRESS.slice(0, 20)}...</code></span>
            <span>🌐 Testnet Network</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Wallet Address Display */}
        {walletAddress && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h3 className="text-sm font-semibold text-sky-400">Connected Address:</h3>
            <p className="text-xs text-gray-300 break-all font-mono">{walletAddress}</p>
          </div>
        )}

        {/* Shopping Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-gray-400">Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between mb-3 p-3 bg-gray-700 rounded">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-400">Qty: {item.quantity} × {item.price} ADA</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-600 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">Total: {getTotalPrice()} ADA</span>
                    </div>
                    <button
                      onClick={processPurchase}
                      disabled={!wallet || isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded font-semibold transition-colors"
                    >
                      {isLoading ? "Processing Payment..." : wallet ? `💳 Pay ${getTotalPrice()} ADA` : "Connect Wallet to Pay"}
                    </button>
                    {wallet && (
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Payment will be sent to seller's Cardano address
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Product Catalog */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">Premium Collection</h2>
          <p className="text-center text-gray-400 mb-8">Luxury watches and fashion items available for purchase with Cardano ADA</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProducts.map(product => (
              <div key={product.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-sky-500">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      product.category === 'watch' ? 'bg-blue-600' : 'bg-pink-600'
                    }`}>
                      {product.category === 'watch' ? '⌚ Watch' : '👗 Dress'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{product.description}</p>
                  <p className="text-xs text-gray-500 mb-3">🏪 Sold by: {product.seller}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-400">₳{product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 hover:scale-105"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Info Section */}
          <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-sky-400">🔒 Secure Payments with Cardano</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🏦</div>
                <h4 className="font-semibold mb-1">Blockchain Security</h4>
                <p className="text-gray-400">All transactions secured by Cardano blockchain</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💸</div>
                <h4 className="font-semibold mb-1">Direct Payments</h4>
                <p className="text-gray-400">Funds go directly to seller's wallet</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🌍</div>
                <h4 className="font-semibold mb-1">Global Access</h4>
                <p className="text-gray-400">Shop from anywhere with ADA</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <MeshBadge isDark={true} />
          <p className="text-gray-400 mt-2">Powered by Cardano & MeshSDK</p>
        </div>
      </footer>
    </div>
  );
}
