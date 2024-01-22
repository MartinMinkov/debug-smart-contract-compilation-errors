import {
  AccountUpdate,
  Bool,
  CircuitString,
  DeployArgs,
  Field,
  method,
  Permissions,
  PrivateKey,
  Provable,
  PublicKey,
  SmartContract,
  state,
  State,
  TokenSymbol,
  UInt32,
  UInt64,
} from 'o1js';

export class E2eZkApp extends SmartContract {
  private static _zkAppUri = 'https://e2e.xyz';
  private static _tokenSymbol = 'E2E';

  private delegatePublicKey: PublicKey = PrivateKey.random().toPublicKey();
  private initialStateValue = BigInt(2);

  events = {
    zkAppDeployment: Field,
    zkAppStateUpdate: Field,
    publicKey: PublicKey,
  };

  @state(Field) zkAppState1 = State<Field>();
  @state(PublicKey) zkAppState2 = State<PublicKey>();
  @state(Bool) zkAppState3 = State<Bool>();
  @state(UInt64) zkAppState4 = State<UInt64>();
  @state(UInt32) zkAppState5 = State<UInt32>();
  @state(PublicKey) zkAppState6 = State<PublicKey>();
  @state(CircuitString) zkAppState7 = State<CircuitString>();
  @state(Field) zkAppState8 = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
      editActionState: Permissions.proofOrSignature(),
      setZkappUri: Permissions.proofOrSignature(),
      setTokenSymbol: Permissions.proofOrSignature(),
      send: Permissions.proofOrSignature(),
      receive: Permissions.proofOrSignature(),
    });
    this.zkAppState1.set(Field(this.initialStateValue));
    this.zkAppState2.set(args?.zkappKey?.toPublicKey() ?? PublicKey.empty());
    this.zkAppState3.set(Bool(true));
    this.zkAppState4.set(UInt64.MAXINT());
    // this.zkAppState7.set(CircuitString.fromString('Hell Yeah Mina!'));
    // this.zkAppState8.set(Field(this.initialStateValue));

    AccountUpdate.setValue(this.self.update.delegate, this.delegatePublicKey);

    this.account.tokenSymbol.set(E2eZkApp._tokenSymbol);
    this.account.zkappUri.set(E2eZkApp._zkAppUri);

    this.emitEvent('zkAppDeployment', Field(0));
    this.emitEvent(
      'publicKey',
      args?.zkappKey?.toPublicKey() ?? PublicKey.empty()
    );
  }

  @method update(squared: Field, delegatePrivateKey: PrivateKey) {
    const zkAppState = this.zkAppState1.get();
    const delegatePublicKey = delegatePrivateKey.toPublicKey();

    this.zkAppState1.assertNothing();
    zkAppState.square().assertEquals(squared);
    this.zkAppState1.set(squared);

    this.account.delegate.assertEquals(delegatePublicKey);
    this.emitEvent('zkAppStateUpdate', Field(1));
  }

  @method updateZkAppUri() {
    this.account.zkappUri.set(E2eZkApp._zkAppUri);
  }

  @method updateTokenSymbol() {
    const tokenSymbol = TokenSymbol.from(E2eZkApp._tokenSymbol);
    tokenSymbol.field = Provable.witness(Field, () => tokenSymbol.field);
    AccountUpdate.setValue(this.self.update.tokenSymbol, tokenSymbol);
  }

  @method mintTokens(receiverAddress: PublicKey, amount: UInt64) {
    this.token.mint({
      address: receiverAddress,
      amount,
    });
  }

  @method sendTokens(
    senderAddress: PublicKey,
    receiverAddress: PublicKey,
    amount: UInt64
  ) {
    this.token.send({
      from: senderAddress,
      to: receiverAddress,
      amount,
    });
  }

  setInitialStateValue(value: bigint) {
    this.initialStateValue = value;
  }

  setDelegatePublicKey(privateKey: string) {
    this.delegatePublicKey = PrivateKey.fromBase58(privateKey).toPublicKey();
  }

  static setZkAppUri(zkAppUri: string) {
    E2eZkApp._zkAppUri = zkAppUri;
  }

  static setTokenSymbol(tokenSymbol: string) {
    E2eZkApp._tokenSymbol = tokenSymbol;
  }
}
