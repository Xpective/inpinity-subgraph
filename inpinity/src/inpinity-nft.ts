import {
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  BlockMirrored as BlockMirroredEvent,
  BlockRevealed as BlockRevealedEvent,
  MetadataUpdate as MetadataUpdateEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RowExpanded as RowExpandedEvent
} from "../generated/InpinityNFT/InpinityNFT"
import {
  Token,
  User,
  Approval,
  ApprovalForAll,
  BlockMirrored,
  BlockRevealed,
  MetadataUpdate,
  OwnershipTransferred,
  RowExpanded,
  Transfer
} from "../generated/schema"

// Transfer-Handler: Aktualisiert Token und User
export function handleTransfer(event: TransferEvent): void {
  // Token-Entität für aktuellen Zustand
  let tokenId = event.params.tokenId.toString()
  let token = Token.load(tokenId)
  if (!token) {
    token = new Token(tokenId)
    token.revealed = false
  }
  token.owner = event.params.to.toHexString()
  token.save()

  // User-Entität für den Empfänger
  let user = User.load(event.params.to.toHexString())
  if (!user) {
    user = new User(event.params.to.toHexString())
    user.save()
  }

  // Event-Entität für Transfer (immutable)
  let transferEvent = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  transferEvent.from = event.params.from
  transferEvent.to = event.params.to
  transferEvent.tokenId = event.params.tokenId
  transferEvent.blockNumber = event.block.number
  transferEvent.blockTimestamp = event.block.timestamp
  transferEvent.transactionHash = event.transaction.hash
  transferEvent.save()
}

// Approval-Handler
export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// ApprovalForAll-Handler
export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// BlockMirrored-Handler
export function handleBlockMirrored(event: BlockMirroredEvent): void {
  let entity = new BlockMirrored(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.mirrorId = event.params.mirrorId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// BlockRevealed-Handler
export function handleBlockRevealed(event: BlockRevealedEvent): void {
  // Token-Entität aktualisieren
  let token = Token.load(event.params.tokenId.toString())
  if (token) {
    token.revealed = true
    token.save()
  }

  // Event-Entität speichern
  let entity = new BlockRevealed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.piDigit = event.params.piDigit
  entity.phiDigit = event.params.phiDigit
  entity.rarity = event.params.rarity
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// MetadataUpdate-Handler
export function handleMetadataUpdate(event: MetadataUpdateEvent): void {
  let entity = new MetadataUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._tokenId = event.params._tokenId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// OwnershipTransferred-Handler
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// RowExpanded-Handler
export function handleRowExpanded(event: RowExpandedEvent): void {
  let entity = new RowExpanded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRow = event.params.newRow
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}