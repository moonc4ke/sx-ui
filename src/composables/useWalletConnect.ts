import { reactive, ref } from 'vue';
import WalletConnect from '@walletconnect/client';
import { isAddress } from '@ethersproject/address';
import { Interface } from '@ethersproject/abi';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getJSON } from '@snapshot-labs/snapshot.js/src/utils';
import { formatUnits } from '@ethersproject/units';
import type { WalletConnectSession, TransactionRequest } from '@/types';

async function getContractABI(address) {
  const uri = 'https://api.etherscan.io/api';
  const params = new URLSearchParams({
    module: 'contract',
    action: 'getAbi',
    address
  });
  const { result } = await getJSON(`${uri}?${params}`);
  return JSON.parse(result);
}

async function parseCall(call) {
  if (call.method === 'eth_sendTransaction') {
    const params = call.params[0];
    return getContractABI(params.to).then(abi => {
      const iface = new Interface(abi);
      const tx = iface.parseTransaction(params);
      return {
        to: params.to,
        _type: 'transactionRequest',
        value: formatUnits(params.value || 0),
        method: tx.signature,
        params: tx.args,
        operation: 0,
        _data: {
          call,
          tx
        },
        data: '',
        _form: {
          abi,
          recipient: params.to,
          method: tx.name,
          args: tx.args,
          amount: formatUnits(params.value || 0)
        }
      };
    });
  }
  return Promise.resolve(false);
}

const initialConnectionDetails: WalletConnectSession = {
  accounts: [],
  bridge: '',
  chainId: 0,
  clientId: '',
  clientMeta: {
    description: '',
    url: '',
    icons: [],
    name: ''
  },
  connected: false,
  handshakeId: 0,
  handshakeTopic: '',
  key: '',
  peerId: '',
  peerMeta: {
    description: '',
    url: '',
    icons: [],
    name: ''
  }
};
const initialRequest: TransactionRequest = {
  _type: 'transactionRequest',
  method: '',
  operation: 0,
  params: [],
  to: '',
  value: '',
  _data: {
    call: {
      method: '',
      params: []
    },
    tx: {
      data: '',
      from: '',
      gasLimit: '',
      gasPrice: '',
      nonce: 0,
      to: '',
      value: ''
    }
  },
  _form: {
    abi: [],
    recipient: '',
    method: '',
    args: [],
    amount: ''
  },
  data: ''
};
const connectionDetails = reactive({
  value: initialConnectionDetails
});
const request = reactive({
  value: initialRequest
});

let connector;

async function listenToCallRequests(connector) {
  connector.on('call_request', async (error, payload) => {
    if (error) {
      throw error;
    }
    try {
      const parsedCall = await parseCall(payload);
      if (parsedCall) {
        request.value = parsedCall as unknown as TransactionRequest;
      }
    } catch (e) {
      console.log(e);
    }
  });
}

export function useWalletConnect() {
  const address = ref('');
  const logged = ref(false);
  const loading = ref(false);
  connectionDetails.value = JSON.parse(localStorage.getItem('linkwalletconnect') as string);

  if (connectionDetails.value) {
    connector = new WalletConnect({
      session: connectionDetails.value as WalletConnectSession,
      storageId: 'linkwalletconnect'
    });

    listenToCallRequests(connector);
  }

  async function logout() {
    if (connector) {
      await connector.killSession();
    }

    localStorage.removeItem('linkwalletconnect');
    connectionDetails.value = initialConnectionDetails;
  }

  async function connect(account, uri) {
    address.value = account;
    loading.value = true;
    if (!isAddress(account)) {
      console.log('Is not address');
      const provider = getProvider('1');
      address.value = await provider.resolveName(account);
    }
    if (!address.value) {
      loading.value = false;
      return;
    }

    connector = new WalletConnect({
      uri,
      storageId: 'linkwalletconnect'
    });
    connector.killSession();
    connector.on('session_request', async (error, payload) => {
      console.log('session_request', error, payload);
      if (error) throw error;
      await connector.approveSession({
        accounts: [address.value],
        chainId: 1
      });
      console.log('connector:', connector);
      console.log('Connected');
      logged.value = true;
      loading.value = false;
      connectionDetails.value = JSON.parse(localStorage.getItem('linkwalletconnect') as string);
    });

    listenToCallRequests(connector);

    connector.on('disconnect', (error, payload) => {
      console.log('disconnect', error, payload);
      if (error) throw error;
    });
  }

  return {
    parseCall,
    connect,
    logout,
    address,
    loading,
    logged,
    request,
    connectionDetails
  };
}
