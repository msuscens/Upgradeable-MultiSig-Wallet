// Wallets owners, approvers and required number of transaction approvals
const owners =
  [
    "0xfC1d4eA100c57A6D975eD8182FaAcFD17871a1e4",
    "0x68F8F71A19b06d425edD180A6Bd9a741CA3C485C",
    "0xd9B822DA7B6f936f85114A5d2D1584741751cb22"
  ]
const numTxApprovals = 2

// Deploy the Wallet's Logic contract
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const MultiSigWallet = artifacts.require("MultiSigWallet")
const WalletProxyAdmin = artifacts.require("WalletProxyAdmin")
const WalletProxy = artifacts.require("WalletProxy")

let logicInstance
let adminInstance
let walletProxyInstance

module.exports = async function (deployer, network, accounts) {
  // Deploy the Wallet's Logic contract
  logicInstance = await deployProxy(
    MultiSigWallet, 
    [owners, numTxApprovals], 
    { deployer }
  )
  console.log("Deployed Logic Contract - MultiSigWallet:", logicInstance.address)

  // Deploy the Wallet's Admin contract
  await deployer.deploy(WalletProxyAdmin)
  adminInstance = await WalletProxyAdmin.deployed()
  console.log("Deployed WalletProxyAdmin:", adminInstance.address)
  
  // Deploy the Wallet's Proxy contract 
  await deployer.deploy(
    WalletProxy,
    logicInstance.address,
    adminInstance.address,
    "0x",
    {from: accounts[0]}
  )
  walletProxyInstance = await WalletProxy.deployed()
  console.log("Deployed WalletProxy:", walletProxyInstance.address)
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


