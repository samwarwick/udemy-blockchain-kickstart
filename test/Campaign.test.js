const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaign;
let campaignAddress;

// NOTE: Ganache accounts are not reset between tests

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({data: compiledFactory.evm.bytecode.object})
        .send({from: accounts[0], gas: '5000000'});

    // Wei
    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    }); 

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe('Campaigns', () => {
    it('deploys a factory and campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('allows people to contribute money and mark them as approvers', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: '200'    
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[0],
                gas: '1000000',
                value: 50
            })
            assert(false);
        } catch (err){
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Buy batteries', '100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            })
        const request = await campaign.methods.requests(0).call();
        assert.equal(request.description, 'Buy batteries');
    });

    // E2E scenario
    it('processes a complete request', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            // gas: '1000000',
            value: web3.utils.toWei('10', 'ether')
        })

        await campaign.methods
            .createRequest('Buy stuff', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({
                from: accounts[0],
                gas:'1000000'
            });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas:'1000000'
        });

        await campaign.methods.finaliseRequest(0).send({
            from: accounts[0],
            gas:'1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance > 104);
    });
})
