Project Introduction

Project - Upgradeable Multisig Wallet
An upgradeable, pausabile, MultiSig Wallet that uses the Open Zeppelin templates.
Taking the basic MultiSigWallet contract that I developed previously, and then 
developing it further to make it an owner upgradable MultiSig Wallet smart contract 
(that upon upgrade keeps the wallet's existing data/contents intact).
___________________________________________________________________________________

Preparation : Set up my multiSigWallet code in Truffle, so that it compiles
            with solc 0.8.4 and is deployable to gananche-cli local blockchain.
Which I did as follows:
1. Set up new drirectory for this project ('Upgradeable MultiSig Wallet')
2. In console (in 'Upgradeable MultiSig Wallet' directory):
    $ npm init
    $ truffle init
    $ npm install @openzeppelin
3. Copy my multiSig wallet code (MultiSigWallet.sol, MultiOwnable.sol,
Approvable.sol) into : 'Upgradeable MultiSig Wallet'/contracts folder
4. Update the .sol files (that are on pragma solidity 0.7.0) to 0.8.4 and
convert 0.7 code to use explicit address to address payable cast (i.e.
'payable(<address>')
5. Add 'SPDX-License-Identifier: MIT' comment to top of each .sol file
(to eliminate compile warnings)
6. Update truffle-config.js to specify solc 0.8.4 compiler,
7. Add a deployment file into migrations direcectory: 2_multi_sig_wallet.js
This defines the owner addresses and number of required approvals and then 
passeses these as parameters to the multiSigWallet constructor (on deployment)
8. Compile to ensure that base version actually compiles:
    $ truffle compile
9. Create a VSCode Workspace (UpgradeableMultiSigWallet.code-workspace)
10. Start up ganance-cli:
    $ ganache-cli -h 127.0.0.1 -p 8545 -m "quick brown fox jumped over the lazy dog"
11. In truffle-config.js: Uncomment in 'networks' the 'developmemt' config settings
12 Migrate:
    $ truffle migrate --reset
13. In my Github create a new repository (Upgradeable-MultiSig-Wallet)
14 Add .gitigore file, initiate git in the project directory, and make first commit:
    $ git init
    $ git add .
    $ git commit -m "Setup my MultiSigWallet code in Truffle"
15 Link git to GitHub repository and push current git contents to it
    $ git remote add origin https://github.com/msuscens/Upgradeable-MultiSig-Wallet.git
    $ git push -u origin master



    
 