# inpinity-subgraph
Subgraph for Inpinity NFTs, Farming, Pirates on Base
# INPINITY Subgraph

This repository contains the **official subgraph** for the Inpinity ecosystem on **Base Mainnet**. It indexes all core smart contracts, including the Pi‑Phi Pyramid NFT, farming, pirates, mercenaries, partnerships, and the two main tokens INPI and Pitrone.

## 📌 Live Subgraph (v0.0.7)

- **Studio URL**: [https://thegraph.com/studio/subgraph/inpinity](https://thegraph.com/studio/subgraph/inpinity)
- **Query Endpoint**:  
  `https://api.studio.thegraph.com/query/1743108/inpinity/version/latest`  
  (rate‑limited to 3000 queries/day – publish to get an unlimited production endpoint)

## 🏗️ Smart Contracts (Base Mainnet)

| Contract         | Address                                      | Start Block |
|------------------|----------------------------------------------|-------------|
| InpinityNFT      | `0x277a0D5864293C78d7387C54B48c35D5E9578Ab1` | 42820334    |
| FarmingV1        | `0xd9722fB6e9b8e71399A970d4e8F4D628C532E94f` | 42822062    |
| PiratesV1        | `0xfD4B74AFF77eeB03FA5bB64Ec701504757BF2585` | 42822189    |
| MercenaryV1      | `0x7719516e40A9E8b47d5967ED7E3cB4D528fd18DF` | 42822147    |
| PartnershipV1    | `0x83F5592f2fA5Fd3b2FE742B4B0012e1351dF0a7a` | 42822214    |
| INPI Token       | `0x232FB12582ac10d5fAd97e9ECa22670e8Ba67d0D` | 42262177    |
| Pitrone Token    | `0x7240Ec5B3Ba944888E186c74D0f8B4F5F71c9AE8` | 42825890    |

## 📊 What is indexed?

- **InpinityNFT** – all `Transfer`, `Approval`, `BlockRevealed`, `BlockMirrored`, `MetadataUpdate`, `OwnershipTransferred`, `RowExpanded` events  
  → entities: `Approval`, `ApprovalForAll`, `BlockMirrored`, `BlockRevealed`, `MetadataUpdate`, `OwnershipTransferred`, `RowExpanded`, `Transfer`, `Token`, `User`
- **FarmingV1** – `FarmStarted`, `ResourcesClaimed`, `ResourcesStolen`  
  → entity: `Farm`
- **PiratesV1** – `AttackStarted`, `AttackExecuted`  
  → entity: `Attack`
- **MercenaryV1** – `ProtectionBought`, `ProtectionExpired`  
  → entity: `Protection`
- **PartnershipV1** – `PartnerAdded`, `PartnerTokenFound`  
  → entity: `Partnership`
- **INPI Token** – `Transfer`, `Approval` (ERC‑20)  
  → entities: `INPITransfer`, `INPIApproval`
- **Pitrone Token** – `Transfer`, `Approval`, `Exchanged`  
  → entities: `PitroneTransfer`, `PitroneApproval`, `PitroneExchange`

## 🛠️ Technology Stack

- **Blockchain**: Base Mainnet
- **Indexing**: [The Graph](https://thegraph.com/) – Subgraph Studio
- **Language**: AssemblyScript (mappings), TypeScript (generated types)
- **Tooling**: `graph-cli`, `ethers.js`

## 🚀 Local Development

### Prerequisites

- Node.js (v20+)
- yarn or npm
- [The Graph CLI](https://thegraph.com/docs/en/developing/creating-a-subgraph/) installed globally:
  ```bash
  yarn global add @graphprotocol/graph-cli
