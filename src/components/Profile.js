import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import NFTTile from "./NFTTile";

export default function Profile () {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const [isLoading, setIsLoading] = useState(true);

    async function getNFTData() {
        try {
            setIsLoading(true);
            const ethers = require("ethers");
            let sumPrice = 0;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            let transaction = await contract.getMyNFTs();
            
            const items = await Promise.all(transaction.map(async i => {
                const tokenURI = await contract.tokenURI(i.tokenId);
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
                sumPrice += Number(price);
                return item;
            }));

            updateData(items);
            updateFetched(true);
            updateAddress(addr);
            updateTotalPrice(sumPrice.toPrecision(3));
        } catch (error) {
            console.error("Error fetching NFT data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if(!dataFetched) {
            getNFTData();
        }
    }, [dataFetched]);

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar></Navbar>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-xl p-6 mb-10 shadow-xl">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="md:flex-1">
                            <h1 className="text-2xl font-bold text-white mb-2">My NFT Collection</h1>
                            <div className="flex items-center">
                                <span className="text-gray-300 mr-2">Wallet:</span>
                                <span className="font-mono text-white text-sm bg-black bg-opacity-30 rounded-md px-3 py-1 truncate">
                                    {address}
                                </span>
                            </div>
                        </div>
                        <div className="md:flex md:space-x-6 mt-4 md:mt-0">
                            <div className="bg-black bg-opacity-30 rounded-lg p-4 text-center mb-4 md:mb-0">
                                <span className="block text-sm text-gray-400">Collection Size</span>
                                <span className="text-2xl font-bold text-white">{data.length}</span>
                            </div>
                            <div className="bg-black bg-opacity-30 rounded-lg p-4 text-center">
                                <span className="block text-sm text-gray-400">Total Value</span>
                                <div className="flex items-center justify-center text-2xl font-bold text-purple-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                    </svg>
                                    {totalPrice} ETH
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-8">Your NFTs</h2>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No NFTs Found</h3>
                        <p className="text-gray-400 mb-6">You don't own any NFTs yet. Explore the marketplace to find your first NFT!</p>
                        <a href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                            Browse Marketplace
                        </a>
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