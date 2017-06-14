import _ from 'lodash'
import Promise from 'bluebird'
import TruffleContract from 'truffle-contract'
import Web3 from 'web3'
import * as oracles from './oracles'

const contractArtifacts = _.fromPairs([
        'Math',
        'EventFactory',
        'EtherToken',
        'CentralizedOracle',
        'CentralizedOracleFactory',
        'UltimateOracle',
        'UltimateOracleFactory',
        'LMSRMarketMaker',
        'StandardMarketFactory'
    ].map((name) => [name, require(`../build/contracts/${name}.json`)]))

class Gnosis {
    static async create(opts) {
        let gnosis = new Gnosis(opts)
        await gnosis.initialized()
        return gnosis
    }

    constructor(opts) {
        opts = _.defaults(opts || {}, {
            ipfs: '',
            gnosisdb: 'https:/db.gnosis.pm'
        })

        if(opts.ethereum == null) {
            // Prefer Web3 injected by the browser (Mist/MetaMask)
            if(typeof web3 !== 'undefined') {
                this.web3 = new Web3(web3.currentProvider)
            } else {
                this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
            }
        } else if(typeof opts.ethereum === 'string') {
            this.web3 = new Web3(new Web3.providers.HttpProvider(opts.ethereum))
        } else {
            throw new TypeError(`type of option \`ethereum\` '${typeof opts.ethereum}' not supported!`)
        }

        this.contracts = _.mapValues(contractArtifacts, (artifact) => {
            let c = TruffleContract(artifact)
            c.setProvider(this.web3.currentProvider)
            return c
        })

        this.contracts.CentralizedOracleFactory.defaults({
            gas: 400000
        })

        this.contracts.UltimateOracleFactory.defaults({
            gas: 900000
        })

        this.TruffleContract = TruffleContract
    }

    async initialized() {
        let accounts
        [accounts, this.etherToken] = await Promise.all([
            Promise.promisify(this.web3.eth.getAccounts)(),
            this.contracts.EtherToken.deployed()
        ])
        if(accounts.length > 0) {
            this.setDefaultAccount(accounts[0])
        }
    }

    setDefaultAccount(account) {
        this.defaultAccount = account
        _.forOwn(this.contracts, (c) => {
            c.defaults({
                from: account
            })
        })
    }
}

_.assign(Gnosis.prototype, oracles)

export default Gnosis;
