// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../node_modules/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract WalletProxy is TransparentUpgradeableProxy {

    // STATE VARIABLES


    // FUNCTIONS
    // Public & External functions
    
    constructor(address _logic, address admin_, bytes memory _data)
        TransparentUpgradeableProxy(_logic, admin_, _data)
    {

    }

}