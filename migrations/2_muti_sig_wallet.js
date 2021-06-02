const MultiSigWallet = artifacts.require("MultiSigWallet");

const owners =
  [
    "0xfC1d4eA100c57A6D975eD8182FaAcFD17871a1e4",
    "0x68F8F71A19b06d425edD180A6Bd9a741CA3C485C",
    "0xd9B822DA7B6f936f85114A5d2D1584741751cb22"
  ]
const numTxApprovals = 2;


module.exports = function (deployer) {
  deployer.deploy(MultiSigWallet, owners, numTxApprovals);
};
