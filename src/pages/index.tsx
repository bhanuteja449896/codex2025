import React, { useState, useEffect } from "react";
import Head from "next/head";
import { BrowserWallet, Transaction, BlockfrostProvider, ForgeScript } from "@meshsdk/core";
import { MeshBadge } from "@meshsdk/react";
import Confetti from "react-confetti";

// Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "watch" | "jewelry";
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

// Premium watches and jewelry collection
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Luxury Gold Watch",
    price: 50, // Reduced prices for testnet
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "watch",
    description: "Exquisite 18k solid gold timepiece featuring Swiss-made automatic movement with 42-hour power reserve. Hand-assembled by master craftsmen with anti-reflective sapphire crystal and exhibition caseback. Limited edition with certificate of authenticity.",
    seller: SELLER_NAME
  },
  {
    id: 2,
    name: "Diamond Tennis Bracelet",
    price: 75,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "jewelry",
    description: "Magnificent 5-carat VVS1 diamond tennis bracelet in platinum setting. Each stone is individually selected for perfect clarity and brilliance. Features secure invisible clasp and comes with GIA certification. A true investment piece for discerning collectors.",
    seller: SELLER_NAME
  },
  {
    id: 3,
    name: "Emerald Ring Set",
    price: 60,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "jewelry",
    description: "Rare Colombian emerald collection featuring AAA-grade stones with exceptional color saturation. Set in 22k yellow gold with micro-pave diamond accents. Each emerald is oil-free and comes with Gübelin certification. Includes matching pendant and earrings.",
    seller: SELLER_NAME
  },
  {
    id: 4,
    name: "Vintage Leather Watch",
    price: 25,
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "watch",
    description: "Heritage timepiece from 1960s featuring original mechanical movement completely restored by certified horologists. Hand-stitched Italian calfskin leather strap with vintage gold buckle. Comes with provenance documentation and original box from estate collection.",
    seller: SELLER_NAME
  },
  {
    id: 5,
    name: "Pearl Earrings",
    price: 45,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "jewelry",
    description: "Lustrous South Sea pearls harvested from pristine Australian waters. Each 12mm pearl exhibits perfect spherical shape with mirror-like nacre quality. Set in platinum with diamond-studded posts. Comes with Mikimoto authentication and luxury presentation box.",
    seller: SELLER_NAME
  },
  {
    id: 6,
    name: "Swiss Automatic Watch",
    price: 85,
    image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "watch",
    description: "Haute horlogerie masterpiece featuring in-house Swiss manufacture movement with 72-hour power reserve. Hand-engraved rotor visible through skeleton caseback. Rose gold case with Côtes de Genève finishing and blue steel hands. COSC chronometer certified.",
    seller: SELLER_NAME
  }
];

export default function Home() {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'watch' | 'jewelry'>('all');
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

  // Wishlist functions
  const addToWishlist = (product: Product) => {
    console.log("❤️ Adding to wishlist:", product.name);
    if (!wishlist.find(item => item.id === product.id)) {
      setWishlist(prev => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId: number) => {
    console.log("💔 Removing from wishlist, ID:", productId);
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  // Filter products based on category
  const filteredProducts = sampleProducts.filter(product => {
    if (categoryFilter === 'all') return true;
    return product.category === categoryFilter;
  });

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-gray-900">
      <Head>
        <title>✨ Luxury Market - Premium NFT Collection with Cardano</title>
        <meta name="description" content="Discover exclusive luxury items with NFT certificates. Purchase premium watches and jewelry with secure Cardano ADA payments and receive blockchain-verified ownership certificates." />
        <meta name="keywords" content="NFT, Cardano, Luxury, Blockchain, Premium, Marketplace" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }
          
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          }
        `}</style>
      </Head>

      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={800}
          gravity={0.2}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347', '#98FB98']}
        />
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-2xl border-b border-gray-200/50 sticky top-0 z-40 animate-fade-in-up">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300 animate-float hover:animate-glow">
                <span className="text-white text-2xl font-bold">💎</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                  Luxury Market
                </h1>
                <p className="text-sm text-gray-500 font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>Premium NFT Collection by {SELLER_NAME}</span>
                </p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-3">
              {/* Category Filters */}
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl p-1 hover-lift">
                {(['all', 'watch', 'jewelry'] as const).map((category, index) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                      categoryFilter === category
                        ? 'bg-white text-purple-600 shadow-md animate-shimmer'
                        : 'text-white/80 hover:text-white hover:bg-white/20'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {category === 'all' ? 'All' : category === 'watch' ? 'Watches' : 'Jewelry'}
                  </button>
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setShowWishlist(!showWishlist)}
                className="group relative bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-pink-600 hover:to-rose-700"
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">❤️</span>
                  <span>Wishlist</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">{wishlist.length}</span>
                </span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-bounce font-bold shadow-lg">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="group relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-emerald-600 hover:to-teal-700"
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">🛒</span>
                  <span>Cart</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">{cart.length}</span>
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-bounce font-bold shadow-lg">
                    {cart.length}
                  </span>
                )}
              </button>
              
              {/* Wallet Connect */}
              <button
                onClick={connectWallet}
                className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  wallet 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{wallet ? "✅" : "🔗"}</span>
                  <span>{wallet ? "Connected" : "Connect Wallet"}</span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Seller Info Bar */}
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-t border-gray-200/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 font-semibold flex items-center space-x-2">
                  <span className="text-lg">💳</span>
                  <span>Secure Payments to:</span>
                </span>
                <code className="bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-mono border border-blue-200 text-blue-800 shadow-sm">
                  {SELLER_ADDRESS.slice(0, 20)}...{SELLER_ADDRESS.slice(-8)}
                </code>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <span>🌐</span>
                  <span>Cardano Testnet</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 animate-pulse"></div>
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-6 py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-6 leading-tight animate-fade-in-up">
              Discover Premium
              <span className="block animate-fade-in-up" style={{animationDelay: '0.2s'}}>Luxury NFTs</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Own unique, blockchain-verified luxury items. Each purchase includes both premium products and exclusive NFT certificates of authenticity powered by Cardano.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-white/80">
                <span className="text-3xl animate-pulse">🎨</span>
                <span className="font-semibold text-gray-700">Luxury Collection</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-white/80">
                <span className="text-3xl animate-pulse">🔒</span>
                <span className="font-semibold text-gray-700">Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-white/80">
                <span className="text-3xl animate-pulse">💎</span>
                <span className="font-semibold text-gray-700">Exclusive Collection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {/* Wallet Address Display */}
        {walletAddress && (
          <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-800">Wallet Connected</h3>
            </div>
            <p className="text-sm text-gray-600 font-mono bg-gray-50/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 break-all">
              {walletAddress}
            </p>
          </div>
        )}

        {/* Shopping Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🛒</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                </div>
                <button 
                  onClick={() => setShowCart(false)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-4">🛒</div>
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some luxury items to get started!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50/70 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ₳{item.price}</p>
                          <p className="text-sm font-bold text-emerald-600">₳{item.quantity * item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ₳{getTotalPrice()}
                      </span>
                    </div>
                    <button
                      onClick={processPurchase}
                      disabled={!wallet || isLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing Payment...</span>
                        </span>
                      ) : wallet ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span className="text-lg">💳</span>
                          <span>Pay ₳{getTotalPrice()} & Mint NFTs</span>
                        </span>
                      ) : (
                        "Connect Wallet to Pay"
                      )}
                    </button>
                    {wallet && (
                      <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                        Payment will be sent to seller's Cardano address<br/>
                        + NFT certificates will be minted to your wallet
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Modal */}
        {showWishlist && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">❤️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
                </div>
                <button 
                  onClick={() => setShowWishlist(false)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-4">💔</div>
                  <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add items you love to save them for later!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50/70 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.category === 'watch' ? '⌚ Watch' : '💎 Jewelry'}</p>
                        <p className="text-sm font-bold text-emerald-600">₳{item.price}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                        >
                          🛒 Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          💔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Catalog */}
        <section className="mb-16">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300">
              Premium Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Exclusive luxury items with blockchain-verified NFT certificates. Each purchase is a step into the future of digital ownership.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="group bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-violet-200 transform hover:-translate-y-4 hover:scale-105 animate-fade-in-up hover-lift"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-64 object-cover group-hover:scale-125 transition-transform duration-700 group-hover:rotate-1" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-2xl text-sm font-bold text-white shadow-lg backdrop-blur-sm ${
                      product.category === 'watch' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                        : 'bg-gradient-to-r from-pink-500 to-purple-600'
                    }`}>
                      {product.category === 'watch' ? '⌚ Watch' : '� Jewelry'}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                      className={`p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                        isInWishlist(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">❤️</span>
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-violet-600 transition-colors duration-300">{product.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="text-lg">🏪</span>
                      <span className="font-medium">{product.seller}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                        ₳{product.price}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">+ NFT Certificate</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl hover:animate-glow active:scale-95"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span className="text-lg animate-bounce">🛒</span>
                      <span>Add to Cart</span>
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 mb-16 hover-lift animate-fade-in-up">
          <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
            Why Choose Our Marketplace?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover-lift animate-fade-in-up group" style={{animationDelay: '0.1s'}}>
              <div className="text-5xl mb-4 animate-float group-hover:animate-bounce">🔒</div>
              <h4 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Blockchain Security</h4>
              <p className="text-gray-600 leading-relaxed">All transactions secured by Cardano's proof-of-stake blockchain technology with mathematical certainty</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-green-50/80 border border-emerald-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover-lift animate-fade-in-up group" style={{animationDelay: '0.2s'}}>
              <div className="text-5xl mb-4 animate-float group-hover:animate-bounce" style={{animationDelay: '1s'}}>💸</div>
              <h4 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">Direct Payments</h4>
              <p className="text-gray-600 leading-relaxed">Funds go directly to seller's wallet with no intermediaries, ensuring fast and secure transactions</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 border border-purple-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover-lift animate-fade-in-up group" style={{animationDelay: '0.3s'}}>
              <div className="text-5xl mb-4 animate-float group-hover:animate-bounce" style={{animationDelay: '2s'}}>🌍</div>
              <h4 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-purple-600 transition-colors duration-300">NFT Ownership</h4>
              <p className="text-gray-600 leading-relaxed">Receive unique NFT certificates proving authentic ownership stored permanently on the blockchain</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-12 animate-fade-in-up"  style={{animationDelay: '0.5s'}}>
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center animate-float hover:animate-glow">
                <span className="text-white text-xl font-bold">💎</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                Luxury Market
              </h3>
            </div>
            <MeshBadge isDark={false} />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">Powered by Cardano & MeshSDK</p>
            <p className="text-sm text-gray-500">
              Testnet Environment • All transactions are for demonstration purposes
            </p>
            <p className="text-xs text-gray-400">
              Built with ❤️ for the Cardano ecosystem
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
