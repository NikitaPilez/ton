import { toNano } from '@ton/core';
import { MessageContract } from '../wrappers/MessageContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const messageContract = provider.open(await MessageContract.fromInit());

    await messageContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(messageContract.address);

    // run methods on `messageContract`
}
