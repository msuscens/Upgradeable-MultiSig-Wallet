// Deploy the wallet logic contract, with an associated proxy contract.
// (All subsequent wallet calls should be made on the contract,
// whilst the proxy contract holds the wallet data) 

// Wallet's initialization data
const numTxApprovals = 2
let owners

const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const MultiSigWallet = artifacts.require("MultiSigWallet")

let walletProxyInstance

module.exports = async function (deployer, network, accounts) {

  // Wallet owners
  owners = [
    accounts[0],
    accounts[1],
    accounts[2],
  ]
  
  // Deploy the Wallet proxy with associated Logic contract and initialize
  walletProxyInstance = await deployProxy(
    MultiSigWallet, 
    [owners, numTxApprovals], 
    { deployer }
  )
  console.log("Deployed (proxy & logic), walletProxy:", walletProxyInstance.address)
  
}


// *** To Upgrade: Replace above 'module.exports' with commented out code below
// *** (Assumes there's a new version of the contract called MultiSigWalletV2)
/*
const MultiSigWalletV2 = artifacts.require("MultiSigWalletV2")
module.exports = async function (deployer) {
  const existing = await MultiSigWallet.deployed()
  const instance = await upgradeProxy(existing.address, MultiSigWalletV2, { deployer })
  console.log('Upgraded Wallet Logic:', instance.address)
};
*/


