import React, {useEffect, useState} from 'react'
import {AppBar, Button, Chip, Stack, Toolbar, Typography} from '@mui/material';
import {initializeConnector} from '@web3-react/core'
import {MetaMask} from '@web3-react/metamask'
import { ethers } from 'ethers';
import { formatEther } from '@ethersproject/units';
import abi from './abi.json';

// copy from https://testnet.reiscan.com/address/0x04294758F2C9B32854486843992647fcfBCBA5fE
const contractAddress = '0x04294758F2C9B32854486843992647fcfBCBA5fE'

const [metamask, hooks] = initializeConnector((actions) => new MetaMask(actions))
const { useAccounts, useIsActive, useProvider } = hooks
const getAddressTxt = (str, s = 6, e = 6) => {
    if (str) {
        return `${str.slice(0, s)}...${str.slice(str.length - e)}`;
    }
    return "";
};
function App() {
    const accounts = useAccounts()
    const isActive = useIsActive()
    const provider = useProvider()
    const [balance, setBalance] = useState("")
    useEffect(() => {
        void metamask.connectEagerly()
    }, [])
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const signer = provider.getSigner()
                const smartContract = new ethers.Contract(contractAddress, abi, signer)
                const myBalance = await smartContract.balanceOf(accounts[0])
                // convert unit from wei to ether
                setBalance(formatEther(myBalance))
            } catch(err) {
                console.log(err)
            }
        }
        if (isActive) {
            // Fetch balance when account status is changed
            // (inactive -> active)
            fetchBalance()
        } else {
            // not fetch balance when account status is inactive
        }
    }, [isActive])
    const handleConnect = () => {
        metamask.activate(55556)
    }
    const handleDisconnect = () => {
        metamask.deactivate()
    }
    return (
        <div>
            <AppBar position="static" color="transparent">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        My DApp
                    </Typography>

                    {!isActive ?
                        <Button variant="contained"
                                color="inherit"
                                onClick={handleConnect}
                        >
                            Connect to Wallet
                        </Button>
                        :
                        <Stack direction="row" spacing={1}>
                            <Chip label={getAddressTxt(accounts[0])} />
                            <Button variant="contained"
                                    color="inherit"
                                    onClick={handleDisconnect}
                            >
                                Disconnect
                            </Button>
                        </Stack>
                    }
                </Toolbar>
            </AppBar>
            { isActive && <div>{balance}</div>}
        </div>
    )
}
export default App
