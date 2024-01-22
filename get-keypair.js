import { Lightnet, Mina } from 'o1js';

const network = Mina.Network({
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});
Mina.setActiveInstance(network);

const feePayerPrivateKey = (await Lightnet.acquireKeyPair()).privateKey;
const feePayerAccount = feePayerPrivateKey.toPublicKey();

console.log(
  `Keypair: ${feePayerPrivateKey.toBase58()} ${feePayerAccount.toBase58()}`
);
