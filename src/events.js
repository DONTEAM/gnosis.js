import { getTruffleArgsFromOptions, sendTransactionAndGetResult } from './utils'

/**
 * Creates a categorical event.
 * @param {Contract|string} opts.collateralToken - The collateral token contract or its address
 * @param {Contract|string} opts.oracle - The oracle responsible for resolving this event
 * @param {Number|string|BigNumber} opts.outcomeCount - The number of outcomes of this event
 * @returns {Contract} The created categorical event
 * @alias Gnosis#createCategoricalEvent
 */
export async function createCategoricalEvent (opts) {
    let args = getTruffleArgsFromOptions([
        'collateralToken',
        'oracle',
        'outcomeCount'
    ], opts)

    return await sendTransactionAndGetResult({
        factoryContract: this.contracts.EventFactory,
        methodName: 'createCategoricalEvent',
        methodArgs: args,
        eventName: 'CategoricalEventCreation',
        eventArgName: 'categoricalEvent',
        resultContract: this.contracts.CategoricalEvent
    })
}

/**
 * Creates a scalar event.
 * @param {Contract|string} opts.collateralToken - The collateral token contract or its address
 * @param {Contract|string} opts.oracle - The oracle responsible for resolving this event
 * @param {Number|string|BigNumber} opts.lowerBound - The lower bound for the event outcome
 * @param {Number|string|BigNumber} opts.upperBound - The upper bound for the event outcome
 * @returns {Contract} The created scalar event
 * @alias Gnosis#createScalarEvent
 */
export async function createScalarEvent (opts) {
    let args = getTruffleArgsFromOptions([
        'collateralToken',
        'oracle',
        'lowerBound',
        'upperBound'
    ], opts)

    return await sendTransactionAndGetResult({
        factoryContract: this.contracts.EventFactory,
        methodName: 'createScalarEvent',
        methodArgs: args,
        eventName: 'ScalarEventCreation',
        eventArgName: 'scalarEvent',
        resultContract: this.contracts.ScalarEvent
    })
}

/**
 * Publishes an event description onto IPFS.
 * @param {Object} description - A POD object describing the event
 * @returns {string} The IPFS hash locating the published event
 * @alias Gnosis#publishEventDescription
 */
export async function publishEventDescription (description) {
    return await this.ipfs.addJSONAsync(description)
}

/**
 * Loads an event description from IPFS.
 * @param {string} ipfsHash - The IPFS hash locating the published event
 * @returns {Object} A POD object describing the event
 * @alias Gnosis#loadEventDescription
 */
export async function loadEventDescription (ipfsHash) {
    return await this.ipfs.catJSONAsync(ipfsHash)
}
