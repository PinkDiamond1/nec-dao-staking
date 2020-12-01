import React from 'react';
import ReactDOM from 'react-dom';
import Web3Provider from 'web3-react'
import App from 'components/App';
import * as serviceWorker from './serviceWorker';
import {Provider} from 'mobx-react'
import ReactGA from 'react-ga';
import RootStore from './stores/Root'
import Web3 from 'web3'
import {Connectors} from 'web3-react'
import InjectedConnector from 'components/shell/InjectedConnector'
import LedgerConnector from 'components/shell/LedgerConnector'
import './index.css'

ReactGA.initialize('G-EY9ENBH4R9')
ReactGA.pageview(window.location.pathname + window.location.search)

const {NetworkOnlyConnector} = Connectors
const Ledger = new LedgerConnector({
    supportedNetworkURLs: {'1': process.env.REACT_APP_INFURA_URL || ''},
    defaultNetwork: 1
});
const MetaMask = new InjectedConnector()

const Infura = new NetworkOnlyConnector({
    providerURL: process.env.REACT_APP_INFURA_URL || ''
})

const connectors = {Ledger, MetaMask, Infura}

const Root = (
    <Provider root={RootStore}>
        <Web3Provider connectors={connectors} libraryName="web3.js" web3Api={Web3}>
            <App />
        </Web3Provider>
    </Provider>
)

ReactDOM.render(Root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
