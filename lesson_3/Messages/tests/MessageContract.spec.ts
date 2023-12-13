import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { MessageContract } from '../wrappers/MessageContract';
import '@ton/test-utils';

describe('MessageContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let messageContract: SandboxContract<MessageContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        messageContract = blockchain.openContract(await MessageContract.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await messageContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: messageContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and messageContract are ready to use
    });
});
