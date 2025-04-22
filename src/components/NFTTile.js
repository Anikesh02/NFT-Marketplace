import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        <Link to={newTo} className="group">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-1 transition duration-300">
                <div className="relative">
                    <img 
                        src={IPFSUrl} 
                        alt={data.data.name} 
                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-60 transition duration-300"></div>
                </div>
                <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{data.data.name}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2 h-10">
                        {data.data.description}
                    </p>
                    {data.data.price && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                </svg>
                                <span>{data.data.price} ETH</span>
                            </div>
                            <span className="bg-purple-600 text-xs text-white px-2 py-1 rounded-full">
                                View
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default NFTTile;