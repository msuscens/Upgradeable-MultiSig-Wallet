const Wallet = artifacts.require("MultiSigWallet")
const truffleAssert = require("truffle-assertions")

contract("Wallet", async accounts => {

    "use strict"

    let wallet
    before(async function() {
        wallet = await Wallet.deployed()
    })


    describe("Initial State", () => {
    // NB: For the 'Inital State' tests to be valid the assumption is that
    // the wallet was created with 3 owners and 3 approvers, with 2/3 
    // approvals required before a transaction is actually transfered.
    // The following Truffle accounts must have been set as the owners 
    // (ie. in migrations deployement script):
    //    accounts[0], accounts[1], accounts[2] 
    // Similarly the approvers should have been set to:
    //    accounts[0], accounts[1], accounts[2]
    // (ie. in this instance, the approvers are the owners)

        it ("should have the expected creator"), async () => {
            let creator
            await truffleAssert.passes(
                creator = await wallet.getWalletCreator(),
                "Unable to get wallet's creator"
            )
            assert.equal(creator, accounts[0])
        }

        it ("should have the expected owners"), async () => {
            let owners
            await truffleAssert.passes(
                owners = await wallet.getOwners(),
                "Unable to get wallet's owners"
            )
            assert.equal(
                owners.length, 
                3, 
                "There are ${owners.length} owners but should be 3!"
            )
            for (i=0; i < owners.length; i++){
                assert.equal(
                    owners[i],
                    accounts[i],
                    `Owner ${i} is not the right owner`
                )
            }
        }

        it ("should have the expected approvers"), async () => {
            let approvers 
            await truffleAssert.passes(
                approvers = await wallet.getApprovers(),
                "Unable to get wallet's approvers"
            )
            assert.equal(
                approvers.length, 
                3, 
                `There are ${approvers.length} approvers but should be 3!`
            )
            for (i=0; i < approvers.length; i++){
                assert.equal(
                    approvers[i],
                    accounts[i]
                    `Approver ${i} is not the right approver`
                )
            }
        }

        it ("should have the expected number of required approvals for a transfer"), async () => {
            let requiredApprovals
            await truffleAssert.passes(
                requiredApprovals = await wallet.getMinApprovals(),
                "Unable to get minimum number of approvers"
            )
            assert.equal(
                requiredApprovals,
                2,
                `There are ${requiredApprovals} transfer approvals required but expected 2!`
            )
        }

        it ("should initially have no transfer requests"), async () => {
            let total
            await truffleAssert.passes(
                total = await wallet.totalTransferRequests(),
                "Unable to get total number of transfer requests"
            )
            asset.equal(
                total,
                0,
                `There are ${total} transfer requests, but expected 0!`
            )
        }
    })


    describe("Depositing ETH", () => {

        it("should receive ETH that is sent to it from any account", async () => {
            let intialBalance
            await truffleAssert.passes(
                intialBalance = await wallet.getWalletBalance(),
                "Unable to get wallet's initial balance"
            )
            assert.equal(
                intialBalance, 
                0, 
                `Balance is ${intialBalance} but expected 0 at deployment!`
            )

            await truffleAssert.passes(
                wallet.deposit({value: 100, from: accounts[0]}),
                `Deposit failed from accounts[0]`
            )
            await truffleAssert.passes(
                wallet.deposit({value: 100, from: accounts[1]}),
                `Deposit failed from accounts[1]`
            )
            await truffleAssert.passes(
                wallet.deposit({value: 100, from: accounts[2]}),
                `Deposit failed from accounts[2]`
            )
            await truffleAssert.passes(
                wallet.deposit({value: 100, from: accounts[3]}),
                `Deposit failed from accounts[3]`
            )
            await truffleAssert.passes(
                wallet.deposit({value: 100, from: accounts[4]}),
                `Deposit failed from accounts[4]`
            )

            let balance
            await truffleAssert.passes(
                balance = await wallet.getWalletBalance(),
                "Unable to get wallet's new balance"
            )
            assert.equal(
                balance,
                500,
                `Balance should be 600 but is ${balance} after deposit!`
            )

            // Depositor doesn't call deposit function (but someother unknown function by mistake)
            // await wallet.undefinedFunction({value: 100, from: accounts[5]})  
            // let balance = await wallet.getWalletBalance();
            // assert.equal(
            //    balance,
            //    600,
            //    `Balance should be 600 but is ${balance} after deposit!`
            // )
        })
    })


    describe("Creating and canceling transfer requests", () => {

        it("should only allow a wallet owner to create transfer requests", async () => {

            await truffleAssert.reverts(
                wallet.createTransferRequest(
                    accounts[4],        
                    "Illegal Test transaction", 
                    50,                 
                    {from: accounts[3]}
                )
            )

            await truffleAssert.passes(
                wallet.createTransferRequest(
                    accounts[3],              //toAddress
                    "First Test transaction", //reason
                    50,                       //amountWei
                    {from: accounts[1]}
                ),
                "Failed to create valid transfer request!"
            )
        })

        it("should have stored a submitted transfer request correctly", async () => {
            let transferRequest
            await truffleAssert.passes(
                transferRequest = await wallet.getTransferRequest(0),
            )
            assert.equal(transferRequest.requestor, accounts[1])
            assert.equal(transferRequest.recipient, accounts[3])
            assert.equal(transferRequest.reason, "First Test transaction")
            assert.equal(transferRequest.amount, 50)
            assert.equal(transferRequest.approvals, 0)
            assert.equal(transferRequest.id, 0)
        })

        it("should only allow a wallet owner to cancel (existing) transfer requests", async () => {
            let numRequests
            await truffleAssert.passes(
                numRequests = await wallet.totalTransferRequests()
            )
            assert.equal(
                Number(numRequests),
                1,
                `Number of requests should be 1 but is ${Number(numRequests)}!`
            )

            // Try to cancel non-existant transfer request (NB requestIds start from 0 )
            await truffleAssert.reverts(
                wallet.cancelTransferRequest(
                    numRequests,   //requestId
                    {from: accounts[1]}
                )
            )

            // Non-owner trys to cancel valid transfer request
            const requestId = numRequests - 1
            await truffleAssert.reverts(
                wallet.cancelTransferRequest(
                    numRequests,        //requestId
                    {from: accounts[3]}
                )
            )

            // An owner cancels a valid transfer request
            await truffleAssert.passes(
                wallet.cancelTransferRequest(
                    requestId,
                    {from: accounts[1]}
                ),
                "Owner unable to cancel a transfer request!"
            )

            let request
            await truffleAssert.passes(
                request = await wallet.getTransferRequest(requestId)
            )
            assert.equal(
                Number(request.requestor), 
                0,
                "Able to retreive a deleted transfer request!"
            )
        })
    })


    describe("Approving transfer requests", () => {

        it("should NOT allow transfer request to be approved twice by the same approver", async () => {

            await truffleAssert.passes(
                wallet.createTransferRequest(
                    accounts[4],                //toAddress
                    "Another Test transaction", //reason
                    75,                         //amountWei
                    {from: accounts[0]}
                ),
                "Failed to create valid transfer request!"
            )
            let numRequests
            await truffleAssert.passes(
                numRequests = await wallet.totalTransferRequests()
            )            
            const requestId = numRequests - 1

            // Approver makes first transfer request approval
            await truffleAssert.passes(
                wallet.approveTransferRequest(
                    requestId,
                    {from: accounts[0]}
                ),
                "First approval failed but should have succeded!"
            )
            let request
            await truffleAssert.passes(
                request = await wallet.getTransferRequest(requestId)
            )
            assert.equal(
                Number(request.approvals), 
                1,
                `Transfer request has ${Number(request.approvals)} approvals but expected 1 approval!`
            )

            // Same approver attempts to approve same transfer request again
            await truffleAssert.reverts(
                wallet.approveTransferRequest(
                    requestId,
                    {from: accounts[0]}
                )
            )

            // Check that only one approval has been recorded
            await truffleAssert.passes(
                request = await wallet.getTransferRequest(requestId)
            )
            assert.equal(
                Number(request.approvals), 
                1,
                `Transfer request has ${Number(request.approvals)} approval but expected 1 approval!`
            )
        })

        it("should NOT allow non-approver address to approve a transfer request", async () => {

            let numRequests
            await truffleAssert.passes(
                numRequests = await wallet.totalTransferRequests()
            )      
            const requestId = numRequests - 1

            await truffleAssert.reverts(
                wallet.approveTransferRequest(
                    requestId,
                    {from: accounts[3]}
                )
            )
        })

        it("should send the Tx upon (a transfer request) receiving required number of approvals, with ETH balances being correctly updated", async () => {

            const walletInitialBalance = await wallet.getWalletBalance()
            const payeeInitialBalance = await web3.eth.getBalance(accounts[4])

            let numRequests = await wallet.totalTransferRequests()
            const requestId = numRequests - 1
            
            await truffleAssert.passes(
                wallet.approveTransferRequest(
                    requestId,
                    {from: accounts[1]}
                ),
                "Valid approver was not able to authorise a transfer request!"
            )
            
            const walletNewBalance = await wallet.getWalletBalance()
            const payeeNewBalance = await web3.eth.getBalance(accounts[4])
            assert.equal(
                Number(walletInitialBalance)-75, 
                Number(walletNewBalance),
                `Unexpected Wallet balance after 75 Wei Tx!  Was ${walletInitialBalance}, now ${walletNewBalance}`
            )
            assert.equal(
                Number(payeeInitialBalance)+75, 
                Number(payeeNewBalance),
                `Unexpected payee balance after 75 Wei Tx!  Was ${payeeInitialBalance}, now ${payeeNewBalance}`
            )
        })

        it("should NOT send the Tx again if a previously sent Tx then receives another approval", async () => {
            const walletInitialBalance = await wallet.getWalletBalance()
            const payeeInitialBalance = await web3.eth.getBalance(accounts[4])

            let numRequests = await wallet.totalTransferRequests()
            const requestId = numRequests - 1
            
            await truffleAssert.reverts(
                wallet.approveTransferRequest(
                    requestId,
                    {from: accounts[2]}
                )
            )

            const walletNewBalance = await wallet.getWalletBalance()
            const payeeNewBalance = await web3.eth.getBalance(accounts[4])
            assert.equal(
                Number(walletInitialBalance), 
                Number(walletNewBalance),
                `Wallet balance changed after another approval of an already sent TX!  Was ${walletInitialBalance}, now ${walletNewBalance}`
            )
            assert.equal(
                Number(payeeInitialBalance), 
                Number(payeeNewBalance),
                `Payee balance changed after another approval of an already sent Tx!  Was ${payeeInitialBalance}, now ${payeeNewBalance}`
            )
        })
    })

})