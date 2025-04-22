import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
    const sampleData = [
        {
            "name": "Loading NFTs...",
            "description": "Please wait while we fetch the latest NFTs",
            "image":"https://gateway.pinata.cloud/ipfs/bafkreiag275ykcaqwfjbhoi4vyv3k7ft5auaky62wb2ftsutpm5gpusq2e",
        },
    ];

    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    async function getAllNFTs() {
        try {
            setIsLoading(true);
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            let transaction = await contract.getAllNFTs();

            const items = await Promise.all(transaction.map(async i => {
                var tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                return item;
            }));

            updateData(items);
            updateFetched(true);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if(!dataFetched) {
            getAllNFTs();
        }
    }, [dataFetched]);

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Discover, Collect & Sell <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Extraordinary NFTs</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                        Browse our curated collection of unique digital art and collectibles
                    </p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-medium mb-2">No NFTs Found</h3>
                        <p>Be the first to list your digital artwork!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}