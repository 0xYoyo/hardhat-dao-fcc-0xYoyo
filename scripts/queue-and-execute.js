const {
    developmentChains,
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
} = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const functionToCall = FUNC
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing...")
    const queueTxResponse = await governor.queue(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await queueTxResponse.wait(1)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(MIN_DELAY + 1, (sleepAmount = 1000))
    }
    console.log("Executing...")
    const executeTxResponse = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTxResponse.wait(1)
    console.log(`Box value: ${await box.retrieve()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
