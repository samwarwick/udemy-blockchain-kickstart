// https://docs.soliditylang.org/en/v0.8.11/using-the-compiler.html

const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const CONTRACT_FILENAME = 'Campaign.sol';

const contractsPath = path.resolve(__dirname, 'contracts', CONTRACT_FILENAME);
const source = fs.readFileSync(contractsPath, "utf8");

const input = {
    language: 'Solidity',
    sources: {
        [CONTRACT_FILENAME]: {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts;
fs.ensureDirSync(buildPath);

for (let contract in output[CONTRACT_FILENAME]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract + '.json'),
        output[CONTRACT_FILENAME][contract]
    );
}
