// utils/pools/blockchainDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBlockchainDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed and deployed 10+ smart contracts on Ethereum using Solidity at ${company}`,
            `• Built 5+ decentralized applications (dApps) with Web3.js and ethers.js`,
            `• Implemented 20+ unit tests for smart contracts achieving 95% coverage`,
            `• Participated in 3 blockchain audits identifying 15+ security vulnerabilities`,
            `• Documented 15+ smart contracts with comprehensive technical specifications`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led development of 5+ DeFi protocols handling $10M+ in total value locked at ${company}`,
            `• Built cross-chain bridge connecting 3+ blockchain networks`,
            `• Optimized smart contracts reducing gas fees by 40%`,
            `• Implemented security best practices preventing $2M+ in potential exploits`,
            `• Mentored 5 junior blockchain developers in Solidity and Web3 development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led blockchain team of 12 developers, building DeFi ecosystem with $100M+ TVL at ${company}`,
            `• Defined blockchain architecture adopted across 5+ projects`,
            `• Developed novel consensus mechanism improving throughput by 60%`,
            `• Established smart contract security standards preventing $50M+ in exploits`,
            `• Partnered with auditors to ensure 100% security compliance`
        ];
    }
    return [
        `• Served as Director of Blockchain at ${company}, overseeing 30+ developers and $15M budget`,
        `• Led blockchain transformation securing $500M+ in total value locked`,
        `• Built blockchain organization from ground up, hiring 25+ developers`,
        `• Presented blockchain strategy to board and secured $20M for platform development`,
        `• Mentored 15 blockchain leads who now run their own teams`
    ];
};