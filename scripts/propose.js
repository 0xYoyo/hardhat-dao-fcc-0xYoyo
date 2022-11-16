const {
    developmentChains,
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCRIPTION,
    VOTING_DELAY,
    proposalsFile,
} = require("../helper-hardhat-config")
const { network, deployments, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const fs = require("fs")

async function propose(args, functionToCall, proposalDescription) {
    const { log } = deployments
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposal description: \n ${proposalDescription}`)
    log("----------------------------------------------------")

    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDescription
    )

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1, (sleepAmount = 1000))
    }

    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)
    //Additional info for logging
    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    // save the proposalId
    storeProposalId(proposalId)

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1, (sleepAmount = 1000))
    }
}

function storeProposalId(proposalId) {
    const chainId = network.config.chainId.toString()
    let proposals

    if (fs.existsSync(proposalsFile)) {
        proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    } else {
        proposals = {}
        proposals[chainId] = []
    }
    proposals[chainId].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8")
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
