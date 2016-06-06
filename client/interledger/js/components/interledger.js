import React from 'react/';

import { Navbar, Row, Col, Button } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
// import Assets from './assets';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

import AccountStore from '../../../lib/js/react/stores/account_store';

import BigchainDBLedgerPlugin from './ledgerplugin';


const Interledger = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();
        const accountStore = AccountStore.getState();
        
        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null,
                searchQuery: null,
                ledger: new BigchainDBLedgerPlugin()
            },
            assetStore,
            accountStore
        );
    },

    componentDidMount() {
        const { ledger } = this.state;
        AccountStore.listen(this.onChange);
        AssetStore.listen(this.onChange);

        ledger.connect();
        this.fetchAssetList();
        Scroll.animateScroll.scrollToBottom();
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
        AccountStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    setActiveAccount(account) {
        this.setState({
            activeAccount: account
        });
    },

    resetActiveAccount() {
        this.setState({
            activeAccount: null
        });
    },

    setActiveAsset(asset) {
        this.setState({
            activeAsset: asset
        });
    },

    fetchAssetList() {
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;
        const accountPublicKey = activeAccount ? activeAccount.vk : null;

        AssetActions.fetchAssetList({ accountToFetch: accountPublicKey, search: searchQuery });

        // setTimeout(this.fetchAssetList, 1000);
    },

    render() {
        const { activeAccount, accountList, activeAsset, assetList, assetMeta } = this.state;

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Interledger</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <AccountList
                                activeAccount={activeAccount}
                                appName="interledger"
                                handleAccountClick={this.setActiveAccount} />
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Interledger;