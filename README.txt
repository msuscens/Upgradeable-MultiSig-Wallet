Project - Upgradeable Multisig Wallet

An upgradeable, pausabile, MultiSig Wallet that uses the Open Zeppelin templates.
Taking the basic MultiSigWallet contract that I developed previously, and then 
developing it further to make it an owner upgradable MultiSig Wallet smart contract 
(that upon upgrade keeps the wallet's existing data/contents intact).
___________________________________________________________________________________

THIS README: Forma my personal learning log and records each step I took, 
issues I encounted and any wrong turns taken.

PREPARATION : Set up my multiSigWallet code in Truffle, so that it compiles
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


PREPARATION PART 2:  Creating Test scripts for the MultiSig Wallet
16: Install truffle assertions:
    $ npm install truffle-assertions
17: Develop a series of tests in tests/multiSigWallet_tests.js


CONVERT CONTRACTS TO BE UPGRADABLE:

0. Setup Environment
    i) Upgrade to latest npm version (was on version 7.11.2):
        $ sudo npm install -g npm@7.16.0
    ii) Ensure that Truffle v5.1.35 or greater is installed:
    Upgrade to latest truffle vesion v5.3.9 (was on v5.3.4 but decided 
    to upgrade in anycase):
        $ sudo npm uninstall -g truffle
        $ sudo npm install -g truffle
        $ npx truffle init
    [NB. Vulnerablirties reported upon install and also after running:
        $ npm audit fix 
        43 vulnerabilities (21 low, 17 moderate, 5 high)
      (I didn't run 'npm audit fix --force' since it appears this would have
      installed truffle v5.1.65 - an earlier version than I started with!)
      However, there is an issue raised relating to the depreciated/out of date
      dependencies that give raise to at least some of these vulnerabilities: 
      https://github.com/trufflesuite/truffle/issues/3986
    ]
    iii) Install the Truffle Upgrades plugin:
        $ sudo npm install --save-dev @openzeppelin/truffle-upgrades

1. Upgrade contract code (Approvalable, MultiOwnable, and MultiSigWallet)
    Followed (logic) contract update steps given here:
    https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
    With the following exceptions:
    i) Import path:
        import "../node_modules/@openzeppelin/contracts/proxy/utils/Initializable.sol";
        (NOT: import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";)
    ii) When using multiple inheritence (with Open Zeppelin 'multiple inherited 
        contracts') the overiding function no longer needs to overide each base
        class containing a function of the same name (each specified as 'virtual')
        but rather should specify 'function foo() public virtual overide' 
        i.e. not 'function foo() public virtual overide(Base1, Base2)'
        [Discovered via this blog post: 
        https://forum.openzeppelin.com/t/erc721presetminterpauserautoid-remove-erc721burnable/5375
        ]

2. Amend Migrations file (2_multi_sig_wallet.js)
    Followed the steps given here (under 'Usage with migrations'):
    https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

    Note: Upon migration I got the following error:
    $ truffle migrate --reset

        2_muti_sig_wallet.js
        ====================
        Error: The requested contract was not found. Make sure the source code 
            is available for compilation at getContractNameAndRunValidation ...
            .....
            ....

    Resolved: by deleting the contents of the 'build/contracts folder and
    then trying again:
        $ truffle migrate --reset
        $ truffle tests
    Which now, resulted in successful compile.  And upon executing tests
    they all still pass!
    (Note: Fixed bug with all 'Initial State' tests which were previously
     reporting back as 'pending', rather than as 'passed' due to bracket 
     in wrong place oneach test)

3. Add Upgraded wallet tests (to multiSigWallet_test.js)
    Followed the steps given here (under 'Usage in tests'):
    https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

    i) Write a new V2 wallet smart contract: MultiSigWalletV2.js
        (for now the contract name is the only code difference
        from the (copied) MultiSigWallet contract)   

    ii) Added 'Upgraded wallet' tests to check that upon deployment
    the MultiSigWalletV2 contract it has the same data values as the
    original wallet. Note: Given we have:

    const Wallet = artifacts.require("MultiSigWallet")
    const WalletV2 = artifacts.require("MultiSigWalletV2")

    a. To deploy the wallet use (instead of commented out code):
        // wallet = await Wallet.deployed()
        wallet = await deployProxy(Wallet, [owners, numTxApprovals])

    b. To upgrade wallet use:
        const walletV2 = await upgradeProxy(wallet.address, WalletV2)
    
    Note: '@openzeppelin/truffle-upgrades' provides the functions:
    deployProxy and upgradeProxy (see OZ 'truffle-upgrades' documentation)


ADD PROXY AND PROXYADMIN CONTRACTS: 
    WRITING OWN PROXY CONTRACT-INCORRECT: I now think this step is the
                                    wrong approach (see details below):

1. Create the WalletProxy contract that inherits from OpenZeppelin's
TransparentUpgradeableProxy contract

2. Create the WalletProxyAdmin contract that inherits from OpenZeppelin's
ProxyAdmin contract

3. Update migrations file (renamed:
    2_wallet_logic_&_proxy_&_admin.js) to deploy the contracts in sequence:
      i) MultiSigWallet - the logic contract
     ii) WalletProxyAdmin - the adminstration contract 
    iii) WalletProxy - proxy contract (that inherits from openzeppelin's
        TransparentUpgradeableProxy contract) and who's constructor requires  
        the addresses of the logic & admin contracts.
    iv) IMPORTANT : I now think that this approach is wrong - TBC.
        Ie. I shouldn't create my own proxy contract (walletProxy) but rather
        ALWAYS use deployProxy function to create the proxy (automaticlly)
    Notes:
    a) Similar to in multiSigWallet_test.js, 'truffle upgrades' is employed:
        const { deployProxy } = require('@openzeppelin/truffle-upgrades')
       So that the deployProxy function can be used for the logic contract
       (MultiSigWallet), see:
       https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades
    b) The proxy contract (WalletProxy) has a constructor with the paramters:
            constructor(address _logic, address admin_, bytes memory _data) 
        If `_data` is nonempty, it's used as data in a delegate call to 
        `_logic`. This will typically be an 'encoded function call', and 
        allows initializating the storage of the proxy like a Solidity
        constructor.  To pass '_data' as empty (ie. make no call to '_logic")
        use "0x", eg:
              await deployer.deploy(
                WalletProxy,
                logicInstance.address,
                adminInstance.address,
                "0x"
              )

4. Write tests for the WalletProxy (walletProxy_test.js)
Specifically to test the executution of the wallet (logic)
functions. Ie. tests the execution of MultiSigWallet's functions
but with all function calls being made to the WalletProxy contract.  
(These tests exclude the use of the WalletProxy's admin functions
 - for admin function tests see WalletProxyAdmin_test.js)

IMPORTANT : I now think that this approach is wrong - TBC.
    Ie. I shouldn't create my own proxy contract (walletProxy) but rather
    ALWAYS use deployProxy function to create the proxy (automaticlly).
    THEREFORE I don't need these specific WalletProxy testscripts.

    The approach I've coded here (with my own proxy contract), gives the
    result that logic contract functions are not executed when called on
    the proxy.  For example after 'truffle migrate --reset' see the 
    following truffle console test results:
    
    Mark$ truffle console
    truffle(development)> let proxyInstance = await WalletProxy.deployed()
    undefined
    truffle(development)> await proxyInstance.getWalletBalance()
    Uncaught TypeError: proxyInstance.getWalletBalance is not a function
        at evalmachine.<anonymous>:1:23
    truffle(development)> await proxyInstance.getWalletCreator()
    Uncaught TypeError: proxyInstance.getWalletCreator is not a function
        at evalmachine.<anonymous>:1:23
    truffle(development)> await proxyInstance.totalTransferRequests()
    Uncaught TypeError: proxyInstance.totalTransferRequests is not a function
        at evalmachine.<anonymous>:1:23
    truffle(development)> 
    truffle(development)> let logicInstance = await MultiSigWallet.deployed()
    undefined
    truffle(development)> await logicInstance.getWalletBalance()
    BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }
    truffle(development)> await logicInstance.getWalletCreator()
    '0xfC1d4eA100c57A6D975eD8182FaAcFD17871a1e4'
    truffle(development)> await logicInstance.totalTransferRequests()
    BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }
    truffle(development)> 

    Similarly the tests (see walletProxy_test.js) give the similar results,
    with my walletProxy being unable to locate the wallet logic contract
    (multiSigWallet) functions when they are called against it.
    See my post here for more details:
    https://forum.openzeppelin.com/t/function-call-to-proxy-contract-failing-to-execute-the-logic-contracts-function/10291

    I'm commiting this to git/gitHub in anycase, before reworking code,
    migration and test scripts to just use deployProxy function.
    


______________________________________________________________________________

List of Resources used for developing this upgradeable contract:

https://blog.openzeppelin.com/the-transparent-proxy-pattern/
https://docs.openzeppelin.com/upgrades-plugins/1.x/
https://docs.openzeppelin.com/contracts/3.x/api/proxy
https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-truffle/3579
https://forum.openzeppelin.com/c/support/upgrades/35

Background on Upgrades Plugins (OpenZeppelin CLI no longer being developed):
https://forum.openzeppelin.com/t/building-for-interoperability-why-we-re-focusing-on-upgrades-plugins/4088

Resources on writing Truffle Test Cases:
https://dzone.com/articles/a-few-tips-for-unit-testing-ethereum-smart-contrac



    
 