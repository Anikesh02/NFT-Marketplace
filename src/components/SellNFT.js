import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isListing, setIsListing] = useState(false);
    const location = useLocation();

    async function onChangeFile(e){
        var file = e.target.files[0];
        if (!file) return;
        
        // Create a preview URL for the selected image
        const preview = URL.createObjectURL(file);
        setPreviewURL(preview);
        
        try {
            setIsUploading(true);
            updateMessage("Uploading image to IPFS...");
            const response = await uploadFileToIPFS(file);
            if(response.success === true){
                console.log("Uploaded file to pinata: ", response.pinataURL);
                setFileURL(response.pinataURL);
                updateMessage("");
            }
        } catch (e) {
            console.log("Error during uploading the file", e);
            updateMessage("Error uploading image: " + e.message);
        } finally {
            setIsUploading(false);
        }
    }

    async function uploadMetadataToIPFS(){
        const {name, description, price} = formParams;
        if(!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields and upload an image");
            return null;
        }
        
        const nftJSON = {
            name, description, price, image: fileURL
        };
        
        try {
            updateMessage("Uploading metadata to IPFS...");
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to pinata: ", response);
                updateMessage("");
                return response.pinataURL;
            }
        } catch (e) {
            console.log("Error during uploading the JSON", e);
            updateMessage("Error uploading metadata: " + e.message);
        }
        return null;
    }

    async function listNFT(e) {
        e.preventDefault();
        
        if(!formParams.name || !formParams.description || !formParams.price || !fileURL) {
            updateMessage("Please fill all the fields and upload an image");
            return;
        }
        
        try {
            setIsListing(true);
            const metadataURL = await uploadMetadataToIPFS();
            if (!metadataURL) {
                setIsListing(false);
                return;
            }
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            updateMessage("Creating your NFT, please wait...");
            
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            let listingPrice = await contract.getListPrice();
            listingPrice = listingPrice.toString();
            
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
            updateMessage("Transaction submitted, waiting for confirmation...");
            await transaction.wait();
            
            updateMessage("NFT created successfully!");
            updateFormParams({ name: '', description: '', price: ''});
            setFileURL(null);
            setPreviewURL(null);
            
            setTimeout(() => {
                window.location.replace("/");
            }, 2000);
        } catch (e) {
            updateMessage("Error: " + e.message);
        } finally {
            setIsListing(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar></Navbar>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-1 rounded-xl shadow-xl">
                    <div className="bg-gray-800 rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-white mb-8 text-center">Create & List Your NFT</h1>
                        
                        <div className="mb-8">
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={onChangeFile}
                                    className="hidden"
                                    id="nft-image"
                                    accept="image/*"
                                    disabled={isUploading || isListing}
                                />
                                <label 
                                    htmlFor="nft-image" 
                                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
                                        previewURL ? 'border-purple-400' : 'border-gray-600 hover:border-purple-400'
                                    } transition-colors duration-300`}
                                >
                                    {previewURL ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={previewURL} 
                                                alt="NFT preview" 
                                                className="w-full h-full object-contain rounded-lg" 
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                                <p className="text-white text-center font-medium">Click to change image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-gray-400 mb-1">Click to upload NFT image</p>
                                            <p className="text-gray-500 text-xs">PNG, JPG, GIF (Max 500KB)</p>
                                        </div>
                                    )}
                                    
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                                                <p className="text-white text-sm">Uploading...</p>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        <form>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input 
                                        id="name"
                                        type="text" 
                                        placeholder="NFT Name" 
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        onChange={e => updateFormParams({...formParams, name: e.target.value})}
                                        value={formParams.name}
                                        disabled={isListing}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea 
                                        id="description"
                                        placeholder="NFT Description" 
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="4"
                                        onChange={e => updateFormParams({...formParams, description: e.target.value})}
                                        value={formParams.description}
                                        disabled={isListing}
                                    ></textarea>
                                </div>
                                
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">Price (ETH)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                            </svg>
                                        </div>
                                        <input 
                                            id="price"
                                            type="number" 
                                            placeholder="Min 0.01 ETH" 
                                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            step="0.01"
                                            min="0.01"
                                            onChange={e => updateFormParams({...formParams, price: e.target.value})}
                                            value={formParams.price}
                                            disabled={isListing}
                                        />
                                    </div>
                                </div>
                                
                                {message && (
                                    <div className={`p-4 rounded-lg ${
                                        message.includes("success") ? "bg-green-900 bg-opacity-20 text-green-400" : 
                                        message.includes("Error") ? "bg-red-900 bg-opacity-20 text-red-400" : 
                                        "bg-blue-900 bg-opacity-20 text-blue-400"
                                    }`}>
                                        {message}
                                    </div>
                                )}
                                
                                <button 
                                    type="button"
                                    onClick={listNFT}
                                    disabled={isUploading || isListing || !fileURL}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                                        isUploading || isListing || !fileURL 
                                        ? "bg-gray-600 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                    }`}
                                >
                                    {isListing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                                            Creating NFT...
                                        </div>
                                    ) : (
                                        "Create & List NFT"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}