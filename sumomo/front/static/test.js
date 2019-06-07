
var sample_num;
window.addEventListener('load', () => {
    sample_num = 12;
})

document.getElementById('b4').addEventListener('click', () => {
    // var web3 = new web3(new web3.providers.HttpProvider('https://ropsten.infura.io/v3/d1c2ca461bac473fab373d30b3ab432e'));
    console.log('version is', web3.version);
    console.log('web3.eth.accounts is', web3.eth.accounts.create());
    // web3.personal.newAccount('caterpie', (res) => {
    //     console.log('result is', res);
    // });
})
document.getElementById('b5').addEventListener('click', () => {
    sample_num += 1;
})

document.getElementById('b1').addEventListener('click', () => {
    if (typeof web3 !== 'undefined') {
        console.log('current')
        web3 = new Web3(window.web3.currentProvider);
    } else {
        console.log('infura');
        web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/d1c2ca461bac473fab373d30b3ab432e'));
    }

    console.log(web3);
    console.log('accounts is', window.web3.eth.accounts);
    web3.eth.getAccounts((err, result)=>{
        if (!err)
            console.log('result is', result);
        else
            console.log('err is', err);
    });
    console.log(web3.eth.accounts[0]);
})



document.getElementById('b2').addEventListener('click', function () {
    if (typeof web3 !== 'undefined') {
        console.log('Web3：' + web3.currentProvider.constructor.name);
        web3.eth.getAccounts(function (error, accounts) {
            if (error) return;
            let user_account = accounts[0];
            if (typeof user_account !== 'undefined') {
                console.log(user_account);
                getBalance(user_account);
            } else {
                console.log("ログインして下さい");
            }
        });
    } else {
        console.log('MetaMaskをインストールして下さい');
    }
})


document.getElementById('b3').addEventListener('click', ()=>{
    var address_getset = '0x9ea80b0A4e112944d0E46e945A4361cB23B3B906';
    var abi_getset = '[{"inputs":[{"name":"_n","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"getNum","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_n","type":"uint256"}],"name":"setNum","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    var contract_getset = web3.eth.contract(JSON.parse(abi_getset)).at(address_getset);
    console.log(web3.version);
    console.log(contract_getset);

    contract_getset.setNum(15, (err, res) => {
        if (!err)
            console.log('result is', res.toNumber());
        else
            console.log('err is', err);
    })
    /*
    contract_getset.getNum((err, res) => {
        if (!err)
            console.log('result is', res.toNumber());
        else
            console.log('err is', err);
    })
    */
});


window.addEventListener('load', async () => {
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            web3.eth.getAccounts((err, result)=>{
                if (!err)
                    console.log('result is', result);
                else
                    console.log('err is', err);
            });
            // web3.eth.sendTransaction({});
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        console.log('Legacy side');
        // web3.eth.sendTransaction({});
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

