import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BulkAdder } from '../wrappers/BulkAdder';
import { MessageContract } from '../wrappers/MessageContract';
import '@ton/test-utils';

describe('BulkAdder and Counter', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let bulkAdder: SandboxContract<BulkAdder>;
    let messageContract: SandboxContract<MessageContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        bulkAdder = blockchain.openContract(await BulkAdder.fromInit());
        messageContract = blockchain.openContract(await MessageContract.fromInit(123n));

        deployer = await blockchain.treasury('deployer');

        const deployResultBulkAdder = await bulkAdder.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const deployResultMessageContract = await messageContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResultBulkAdder.transactions).toHaveTransaction({
            from: deployer.address,
            to: bulkAdder.address,
            deploy: true,
            success: true,
        });

        expect(deployResultMessageContract.transactions).toHaveTransaction({
            from: deployer.address,
            to: messageContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and bulkAdder are ready to use
    });

    it('should increase to target', async () => {
        const res = await bulkAdder.send(deployer.getSender(), {
            value: toNano('0.2')
        }, {
            $$type: 'Reach',
            counter: messageContract.address,
            target: 1n,
        })

        const count = await messageContract.getCounter()
        expect(count).toEqual(1n);

        console.log(res)
    });
});
