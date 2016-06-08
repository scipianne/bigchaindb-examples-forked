import React from 'react';

import { Navbar, Row, Col, Button } from 'react-bootstrap/lib';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
import AccountDetail from '../../../lib/js/react/components/account_detail';

import Assets from './assets';
import AssetMatrix from './asset_matrix';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

import AccountStore from '../../../lib/js/react/stores/account_store';


const ShareTrader = React.createClass({

    getInitialState() {
        const accountStore = AccountStore.getState();
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null
            },
            accountStore,
            assetStore
        );
    },

    componentDidMount() {
        AccountStore.listen(this.onAccountStoreChange);
        AssetStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AccountStore.unlisten(this.onAccountStoreChange);
        AssetStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    onAccountStoreChange(state) {
        const oldAccountList = this.state.accountList;
        state.accountList.forEach((account) => {
            if (account.ledger &&
                (!oldAccountList ||
                 (oldAccountList && oldAccountList.indexOf(account) === -1))) {
                account.ledger.on('incoming', this.handleLedgerChanges);
            }
        });

        this.setState(state);
    },


    fetchAssetList({ accountToFetch }) {
        AssetActions.fetchAssetList({
            accountToFetch,
            blockWhenFetching: false
        });
    },

    handleAccountChange(account) {
        this.setState({
            activeAccount: account
        });
    },

    resetActiveAccount() {
        this.handleAccountChange(null);
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);

        if (changes && changes.client) {
            this.fetchAssetList({
                accountToFetch: changes.client
            });
        }
    },

    handleAssetChange(asset) {
        this.setState({
            activeAsset: asset
        });
    },

    mapAccountsOnStates(accountList) {
        const states = {
            'default': 'available'
        };

        if (!accountList) {
            return states;
        }

        for (let i = 0; i < accountList.length; i++) {
            states[accountList[i].vk] = `state${i}`;
        }

        return states;
    },

    flattenAssetList(assetList) {
        let flattenedAssetList = [];
        Object.keys(assetList).forEach((account) => {
            flattenedAssetList = flattenedAssetList.concat(
                assetList[account]
            );
        });
        return flattenedAssetList;
    },

    render() {
        const { activeAccount, accountList, activeAsset, assetList } = this.state;
        const states = this.mapAccountsOnStates(accountList);
        const assetListForAccount =
            activeAccount && Object.keys(assetList).indexOf(activeAccount.vk) > -1 ?
                assetList[activeAccount.vk] : this.flattenAssetList(assetList);
        
        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Share Trader</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <div style={{ textAlign: 'center' }}>
                                <Button
                                    onClick={this.resetActiveAccount}>
                                    Select All
                                </Button>
                            </div>
                            <br />
                            <AccountList
                                activeAccount={activeAccount}
                                appName="sharetrader"
                                handleAccountClick={this.handleAccountChange}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <Row>
                                <Col className="asset-matrix" md={8} xs={6}>
                                    <div className="vertical-align-outer">
                                        <div className="vertical-align-inner">
                                            <AssetMatrix
                                                assetList={assetListForAccount}
                                                cols={8}
                                                handleAssetClick={this.handleAssetChange}
                                                rows={8}
                                                states={states} />
                                        </div>
                                    </div>
                                </Col>
                                <Col className="asset-history" md={4} xs={6}>
                                    <Assets
                                        accountList={accountList}
                                        activeAccount={activeAccount}
                                        activeAsset={activeAsset}
                                        assetClasses={states}
                                        assetList={assetListForAccount}
                                        handleAssetClick={this.handleAssetChange} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default ShareTrader;
