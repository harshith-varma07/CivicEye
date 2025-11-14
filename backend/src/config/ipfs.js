// IPFS client is disabled temporarily due to module compatibility issues
// Use alternative storage method or upgrade to ES modules
let ipfsClient = null;

const initIPFS = async () => {
  try {
    if (process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET) {
      // Dynamically import ipfs-http-client using ES module syntax
      const { create } = await import('ipfs-http-client');
      
      const auth = 'Basic ' + Buffer.from(
        process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
      ).toString('base64');

      ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth,
        },
      });
      console.log('IPFS Client initialized');
    } else {
      console.log('IPFS credentials not found, IPFS client not initialized');
    }
    return ipfsClient;
  } catch (error) {
    console.error('IPFS initialization error:', error);
    return null;
  }
};

const getIPFSClient = () => ipfsClient;

module.exports = { initIPFS, getIPFSClient };
