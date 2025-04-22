import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage (props) {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    async function getNFTData(tokenId) {
        try {
            setIsLoading(true);
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            var tokenURI = await contract.tokenURI(tokenId);
            const listedToken = await contract.getListedTokenForId(tokenId);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let item = {
                price: meta.price,
                tokenId: tokenId,
                seller: listedToken.seller,
                owner: listedToken.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            updateData(item);
            updateDataFetched(true);
            updateCurrAddress(addr);
        } catch (error) {
            console.error("Error fetching NFT data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function buyNFT(tokenId) {
        try {
            setIsProcessing(true);
            updateMessage("Processing your purchase...");
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            let transaction = await contract.executeSale(tokenId, {value:salePrice});
            await transaction.wait();

            updateMessage("Purchase successful! The NFT is now yours.");
            setTimeout(() => {
                updateMessage("");
            }, 5000);
        } catch(e) {
            updateMessage("Error: " + e.message);
            setTimeout(() => {
                updateMessage("");
            }, 5000);
        } finally {
            setIsProcessing(false);
        }
    }

    const params = useParams();
    const tokenId = params.tokenId;
    
    useEffect(() => {
        if(!dataFetched) {
            getNFTData(tokenId);
        }
    }, [dataFetched, tokenId]);

    if(typeof data.image == "string") {
        data.image = GetIpfsUrlFromPinata(data.image);
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar></Navbar>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
                        <div className="md:flex">
                            <div className="md:w-1/2">
                                <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="md:w-1/2 p-8">
                                <div className="border-b border-gray-700 pb-6 mb-6">
                                    <h1 className="text-3xl font-bold text-white mb-2">{data.name}</h1>
                                    <p className="text-gray-300">{data.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Price</p>
                                        <div className="flex items-center text-xl font-bold text-purple-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                            </svg>
                                            <span>{data.price} ETH</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Token ID</p>
                                        <p className="font-mono text-white font-medium truncate">{data.tokenId}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Owner</p>
                                        <p className="font-mono text-white break-all">{data.owner}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Seller</p>
                                        <p className="font-mono text-white break-all">{data.seller}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    {currAddress !== data.owner && currAddress !== data.seller ? (
                                        <button 
                                            className={`w-full py-3 px-4 rounded-lg font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                                                isProcessing 
                                                ? "bg-gray-600 cursor-not-allowed" 
                                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                            }`}
                                            onClick={() => buyNFT(tokenId)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                "Buy this NFT"
                                            )}
                                        </button>
                                    ) : (
                                        <div className="bg-green-900 bg-opacity-20 text-green-400 p-4 rounded-lg text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            You own this NFT
                                        </div>
                                    )}
                                    
                                    {message && (
                                        <div className={`mt-4 p-3 rounded-lg text-center ${
                                            message.includes("successful") 
                                            ? "bg-green-900 bg-opacity-20 text-green-400" 
                                            : message.includes("Error") 
                                            ? "bg-red-900 bg-opacity-20 text-red-400"
                                            : "bg-blue-900 bg-opacity-20 text-blue-400"
                                        }`}>
                                            {message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}