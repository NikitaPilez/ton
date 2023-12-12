import {mnemonicToWalletKey} from "ton-crypto";
import {fromNano, internal, TonClient, WalletContractV4} from "ton";
import {getHttpEndpoint} from "@orbs-network/ton-access";
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const mnemonic = process.env.MNEMONIC || ''
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({publicKey: key.publicKey, workchain: 0})

    const endpoint = await getHttpEndpoint({network: "testnet"})
    const client = new TonClient({endpoint})

    if (!await client.isContractDeployed(wallet.address)) {
        return console.log("is not deployed")
    }

    const balance = await client.getBalance(wallet.address)
    console.log(fromNano(balance))

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
                value: "0.05",
                body: "Hello",
                bounce: false,
            })
        ]
    })

    let currentSeqno = seqno

    while(currentSeqno == seqno) {
        console.log("Waiting for transaction to confirm..")
        await sleep(1500)
        currentSeqno = await walletContract.getSeqno()
    }

    console.log("transaction confirmed!")
}

main();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}