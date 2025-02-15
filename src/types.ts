export type Space = {
  id: string;
  name: string;
  about?: string;
  controller: string;
  voting_delay: number;
  min_voting_period: number;
  max_voting_period: number;
  proposal_threshold: number;
  quorum: number;
  strategies: string[];
  authenticators: string[];
  executors: string[];
  proposal_count: number;
  vote_count: number;
  created: number;
};

export type Proposal = {
  id: string;
  proposal_id: number;
  space: {
    id: string;
    quorum: number;
    authenticators: string[];
    executors: string[];
  };
  author: {
    id: string;
  };
  execution_hash: string;
  metadata_uri: string;
  title: string;
  body: string;
  discussion: string;
  execution: Transaction[];
  start: number;
  min_end: number;
  max_end: number;
  snapshot: number;
  scores_1: number;
  scores_2: number;
  scores_3: number;
  scores_total: number;
  strategies: string[];
  created: number;
  tx: string;
  vote_count: number;
  has_ended: boolean;
};

export type User = {
  id: string;
  proposal_count: number;
  vote_count: number;
  created: number;
};

export type Vote = {
  id: string;
  voter: {
    id: string;
  };
  space: {
    id: string;
  };
  proposal: number;
  choice: number;
  vp: number;
  created: number;
};

export type Draft = {
  title: string;
  body: string;
  discussion: string;
  execution: Transaction[];
  updatedAt: number;
};

export type Metadata = {
  title: string;
  body: string;
  discussion: string;
  execution: Transaction[];
};

export type WalletConnectSession = {
  accounts: string[];
  bridge: string;
  chainId: number;
  clientId: string;
  clientMeta: {
    description: string;
    url: string;
    icons: [];
    name: string;
  };
  connected: boolean;
  handshakeId: number;
  handshakeTopic: string;
  key: string;
  peerId: string;
  peerMeta: {
    description: string;
    url: string;
    icons: [];
    name: string;
  };
};

export type Drafts = Record<string, Draft>;

export type BaseTransaction = {
  to: string;
  data: string;
  value: string;
};

export type SendTokenTransaction = BaseTransaction & {
  _type: 'sendToken';
  _form: {
    recipient: string;
    amount: string;
    token: {
      name: string;
      decimals: number;
      symbol: string;
      address: string;
    };
  };
};

export type SendNftTransaction = BaseTransaction & {
  _type: 'sendNft';
  _form: {
    recipient: string;
    amount: string;
    nft: {
      address: string;
      id: string;
      name: string;
      collection?: string;
    };
  };
};

export type ContractCallTransaction = BaseTransaction & {
  _type: 'contractCall';
  _form: {
    abi: any[];
    recipient: string;
    method: string;
    args: any;
    amount?: string;
  };
};

export type TransactionRequest = BaseTransaction & {
  _type: 'transactionRequest';
  method: string;
  operation: number;
  params: any[];
  to: string;
  value: string;
  _data: {
    call: {
      method: string;
      params: any[];
    };
    tx: {
      data: string;
      from: string;
      gasLimit: string;
      gasPrice: string;
      nonce: number;
      to: string;
      value: string;
    };
  };
  _form: {
    abi: any[];
    recipient: string;
    method: string;
    args: any;
    amount?: string;
  };
};

export type Transaction =
  | SendTokenTransaction
  | SendNftTransaction
  | ContractCallTransaction
  | TransactionRequest;
