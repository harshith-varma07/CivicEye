const { create } = require('ipfs-http-client');

let ipfsClient;

const initIPFS = () => {
  try {
    if (process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET) {
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
    }
    return ipfsClient;
  } catch (error) {
    console.error('IPFS initialization error:', error);
    return null;
  }
};

const getIPFSClient = () => ipfsClient;

module.exports = { initIPFS, getIPFSClient };
