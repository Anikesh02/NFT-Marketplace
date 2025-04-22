import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function getAddress() {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }
  
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
    } catch (error) {
      console.error("Error fetching address:", error.message);
    }
  }

  function updateButton() {
    const ethereumButton = document.querySelector(".enableEthereumButton");
    if (ethereumButton) {
      ethereumButton.textContent = "Connected";
      ethereumButton.classList.remove("bg-blue-600");
      ethereumButton.classList.add("bg-green-600");
    }
  }

  async function connectWebsite() {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });
      updateButton();
      getAddress();
      window.location.replace(location.pathname);
    } catch (error) {
      console.error("Connection error:", error);
    }
  }

  useEffect(() => {
    if (window.ethereum === undefined) return;
    let val = window.ethereum.isConnected();
    if (val) {
      getAddress();
      toggleConnect(val);
      updateButton();
    }

    window.ethereum.on("accountsChanged", function (accounts) {
      window.location.replace(location.pathname);
    });
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 to-indigo-800 shadow-lg">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
              <span className="font-bold text-xl ml-2 text-white">NFT Realm</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700 transition duration-300 ${
                  location.pathname === "/" ? "bg-purple-700" : ""
                }`}
              >
                Marketplace
              </Link>
              
              <Link 
                to="/sellNFT" 
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700 transition duration-300 ${
                  location.pathname === "/sellNFT" ? "bg-purple-700" : ""
                }`}
              >
                List My NFT
              </Link>
              
              <Link 
                to="/profile" 
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700 transition duration-300 ${
                  location.pathname === "/profile" ? "bg-purple-700" : ""
                }`}
              >
                Profile
              </Link>
              
              <button
                className="enableEthereumButton ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                onClick={connectWebsite}
              >
                {connected ? "Connected" : "Connect Wallet"}
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg 
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 transition duration-300 ${
                location.pathname === "/" ? "bg-purple-700" : ""
              }`}
            >
              Marketplace
            </Link>
            
            <Link 
              to="/sellNFT" 
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 transition duration-300 ${
                location.pathname === "/sellNFT" ? "bg-purple-700" : ""
              }`}
            >
              List My NFT
            </Link>
            
            <Link 
              to="/profile" 
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 transition duration-300 ${
                location.pathname === "/profile" ? "bg-purple-700" : ""
              }`}
            >
              Profile
            </Link>
            
            <button
              className="enableEthereumButton mt-2 w-full flex justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
              onClick={connectWebsite}
            >
              {connected ? "Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>
      
      {currAddress !== "0x" && (
        <div className="bg-gray-800 py-2 px-4 text-right text-sm">
          <span className="text-gray-400">
            {currAddress !== "0x" ? "Connected to: " : "Not Connected"}
          </span>
          {currAddress !== "0x" && (
            <span className="text-purple-300 font-mono">
              {currAddress.substring(0, 6) + "..." + currAddress.substring(currAddress.length - 4)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;