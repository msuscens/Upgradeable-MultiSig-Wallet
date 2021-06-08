const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const MultiSigWallet = artifacts.require("MultiSigWallet")

const owners =
  [
    "0xfC1d4eA100c57A6D975eD8182FaAcFD17871a1e4",
    "0x68F8F71A19b06d425edD180A6Bd9a741CA3C485C",
    "0xd9B822DA7B6f936f85114A5d2D1584741751cb22"
  ]
const numTxApprovals = 2


module.exports = async function (deployer) {
  const instance = await deployProxy(MultiSigWallet, [owners, numTxApprovals], { deployer })
  console.log('Deployed:', instance.address)
  // deployer.deploy(MultiSigWallet, owners, numTxApprovals) // OLD VERSION - DELETE
};

// *** To Upgrade: Replace above 'module.exports' with commented out code below
// *** (Assumes there's a new version of the contract called MultiSigWalletV2)
/*
const MultiSigWalletV2 = artifacts.require("MultiSigWalletV2")
module.exports = async function (deployer) {
  const existing = await MultiSigWallet.deployed()
  const instance = await upgradeProxy(existing.address, MultiSigWalletV2, { deployer })
  console.log('Upgraded:', instance.address)
};
*/


