import {
    Transfer as TransferEvent,
    Approval as ApprovalEvent,
    ApprovalForAll as ApprovalForAllEvent,
    BlockRevealed as BlockRevealedEvent
  } from "../generated/InpinityNFT/InpinityNFT"
  import {
    FarmingStarted as FarmingStartedEvent,
    FarmingStopped as FarmingStoppedEvent
  } from "../generated/FarmingV1/FarmingV1"
  import { Token, User, Farm, Approval, ApprovalForAll } from "../generated/schema"
  
  // NFT Handlers
  export function handleTransfer(event: TransferEvent): void {
    let token = Token.load(event.params.tokenId.toString())
    if (!token) {
      token = new Token(event.params.tokenId.toString())
      token.revealed = false
    }
    token.owner = event.params.to.toHexString()
    token.save()
  
    let user = User.load(event.params.to.toHexString())
    if (!user) {
      user = new User(event.params.to.toHexString())
      user.save()
    }
  }
  
  export function handleApproval(event: ApprovalEvent): void {
    let entity = new Approval(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.owner = event.params.owner
    entity.approved = event.params.approved
    entity.tokenId = event.params.tokenId
  
    entity.save()
  }
  
  export function handleApprovalForAll(event: ApprovalForAllEvent): void {
    let entity = new ApprovalForAll(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.owner = event.params.owner
    entity.operator = event.params.operator
    entity.approved = event.params.approved
  
    entity.save()
  }
  
  export function handleBlockRevealed(event: BlockRevealedEvent): void {
    let token = Token.load(event.params.tokenId.toString())
    if (token) {
      token.revealed = true
      token.save()
    }
  }
  
  // Farming Handlers
  export function handleFarmingStarted(event: FarmingStartedEvent): void {
    let tokenId = event.params.tokenId.toString()
    let farm = new Farm(tokenId)
    farm.startTime = event.params.startTime
    farm.lastClaim = event.params.startTime
    farm.active = true
    farm.save()
  
    let token = Token.load(tokenId)
    if (token) {
      token.farm = farm.id
      token.save()
    }
  }
  
  export function handleFarmingStopped(event: FarmingStoppedEvent): void {
    let tokenId = event.params.tokenId.toString()
    let farm = Farm.load(tokenId)
    if (farm) {
      farm.active = false
      farm.save()
    }
  }