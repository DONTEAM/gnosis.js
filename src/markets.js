import {
    normalizeWeb3Args, wrapWeb3Function,
    requireEventFromTXResult, sendTransactionAndGetResult
} from './utils'

/**
 * Creates a market.
 *
 * Note: this method is asynchronous and will return a Promise
 *
 * @function
 * @param {(Contract|string)} opts.event - The forwarded oracle contract or its address
 * @param {(Contract|string)} opts.marketMaker - The collateral token contract or its address
 * @param {(number|string|BigNumber)} opts.fee - The fee factor. Specifying 1,000,000 corresponds to 100%, 50,000 corresponds to 5%, etc.
 * @returns {Contract} The created market contract instance
 * @alias Gnosis#createMarket
 */
export const createMarket = wrapWeb3Function((self, opts) => ({
    callerContract: opts.marketFactory,
    callerABI: self.contracts.MarketFactory.abi,
    methodName: 'createMarket',
    eventName: 'MarketCreation',
    eventArgName: 'market',
    resultContract: self.contracts.Market,
    argAliases: {
        event: 'eventContract',
    }
}))

/**
 * Buys outcome tokens. If you have ether and plan on transacting with a market on an event which
 * uses EtherToken as collateral, be sure to convert the ether into EtherToken by sending ether to
 * the deposit() method of the contract. For other ERC20 collateral tokens, follow the token's
 * acquisition process defined by the token's contract.
 *
 * Note: this method is asynchronous and will return a Promise
 *
 * @param {(Contract|string)} opts.market - The market to buy tokens from
 * @param {(number|string|BigNumber)} opts.outcomeTokenIndex - The index of the outcome
 * @param {(number|string|BigNumber)} opts.outcomeTokenCount - Number of outcome tokens to buy
 * @returns {BigNumber} How much collateral tokens caller paid
 * @alias Gnosis#buyOutcomeTokens
 */
export async function buyOutcomeTokens() {
    const [[market, outcomeTokenIndex, outcomeTokenCount], opts] =
        normalizeWeb3Args(Array.from(arguments), {
            methodName: 'calcLMSRCost',
            functionInputs: [
                { name: 'market', type: 'address' },
                { name: 'outcomeTokenIndex', type: 'uint8'},
                { name: 'outcomeTokenCount', type: 'uint256'},
            ]
        })

    const collateralToken = this.contracts.Token.at(
        await this.contracts.Event.at(
            await this.contracts.Market.at(market).eventContract()
        ).collateralToken()
    )
    const baseCost = await this.lmsrMarketMaker.calcCost(market, outcomeTokenIndex, outcomeTokenCount)

    requireEventFromTXResult(await collateralToken.approve(market, outcomeTokenCount), 'Approval')

    return await sendTransactionAndGetResult({
        callerContract: this.contracts.Market.at(market),
        methodName: 'buy',
        methodArgs: [outcomeTokenIndex, outcomeTokenCount, baseCost],
        eventName: 'OutcomeTokenPurchase',
        eventArgName: 'cost',
    })
}

/**
 * Sells outcome tokens. If transacting with a market which deals with EtherToken as collateral,
 * will need additional step of sending a withdraw(uint amount) transaction to the EtherToken
 * contract if raw ether is desired.
 *
 * Note: this method is asynchronous and will return a Promise
 *
 * @param {(Contract|string)} opts.market - The market to sell tokens to
 * @param {(number|string|BigNumber)} opts.outcomeTokenIndex - The index of the outcome
 * @param {(number|string|BigNumber)} opts.outcomeTokenCount - Number of outcome tokens to sell
 * @returns {BigNumber} How much collateral tokens caller received from sale
 * @alias Gnosis#sellOutcomeTokens
 */
export async function sellOutcomeTokens() {
    const [[market, outcomeTokenIndex, outcomeTokenCount], opts] =
        normalizeWeb3Args(Array.from(arguments), {
            methodName: 'calcLMSRCost',
            functionInputs: [
                { name: 'market', type: 'address' },
                { name: 'outcomeTokenIndex', type: 'uint8'},
                { name: 'outcomeTokenCount', type: 'uint256'},
            ]
        })

    const outcomeToken = this.contracts.Token.at(
        await this.contracts.Event.at(
            await this.contracts.Market.at(market).eventContract()
        ).outcomeTokens(outcomeTokenIndex)
    )
    const minProfit = await this.lmsrMarketMaker.calcProfit(market, outcomeTokenIndex, outcomeTokenCount)

    requireEventFromTXResult(await outcomeToken.approve(market, outcomeTokenCount), 'Approval')

    return await sendTransactionAndGetResult({
        callerContract: this.contracts.Market.at(market),
        methodName: 'sell',
        methodArgs: [outcomeTokenIndex, outcomeTokenCount, minProfit],
        eventName: 'OutcomeTokenSale',
        eventArgName: 'profit',
    })
}
