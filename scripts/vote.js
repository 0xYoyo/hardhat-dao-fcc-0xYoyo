const { developmentChains, proposalsFile, VOTING_PERIOD } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const fs = require("fs")

async function main() {
    const chainId = network.config.chainId.toString()
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    const proposalId = proposals[chainId].at(-1)
    // 0= Against, 1= For, 2= Abstain
    const voteWay = 1
    reason = "I like to move it move it"
    await vote(proposalId, voteWay, reason)
}

async function vote(proposalId, voteWay, reason) {
    console.log("Voting...")
    const governor = await ethers.getContract("GovernorContract")
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
    const voteTxReceipt = await voteTxResponse.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1, (sleepAmount = 1000))
    }
    console.log(`Current Proposal State: ${proposalState}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
