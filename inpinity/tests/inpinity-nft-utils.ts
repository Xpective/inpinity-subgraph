import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  BlockMirrored,
  BlockRevealed,
  MetadataUpdate,
  OwnershipTransferred,
  RowExpanded,
  Transfer
} from "../generated/InpinityNFT/InpinityNFT"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBlockMirroredEvent(
  tokenId: BigInt,
  mirrorId: BigInt
): BlockMirrored {
  let blockMirroredEvent = changetype<BlockMirrored>(newMockEvent())

  blockMirroredEvent.parameters = new Array()

  blockMirroredEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  blockMirroredEvent.parameters.push(
    new ethereum.EventParam(
      "mirrorId",
      ethereum.Value.fromUnsignedBigInt(mirrorId)
    )
  )

  return blockMirroredEvent
}

export function createBlockRevealedEvent(
  tokenId: BigInt,
  piDigit: i32,
  phiDigit: i32,
  rarity: i32
): BlockRevealed {
  let blockRevealedEvent = changetype<BlockRevealed>(newMockEvent())

  blockRevealedEvent.parameters = new Array()

  blockRevealedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  blockRevealedEvent.parameters.push(
    new ethereum.EventParam(
      "piDigit",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(piDigit))
    )
  )
  blockRevealedEvent.parameters.push(
    new ethereum.EventParam(
      "phiDigit",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phiDigit))
    )
  )
  blockRevealedEvent.parameters.push(
    new ethereum.EventParam(
      "rarity",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(rarity))
    )
  )

  return blockRevealedEvent
}

export function createMetadataUpdateEvent(_tokenId: BigInt): MetadataUpdate {
  let metadataUpdateEvent = changetype<MetadataUpdate>(newMockEvent())

  metadataUpdateEvent.parameters = new Array()

  metadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenId",
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )

  return metadataUpdateEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRowExpandedEvent(newRow: BigInt): RowExpanded {
  let rowExpandedEvent = changetype<RowExpanded>(newMockEvent())

  rowExpandedEvent.parameters = new Array()

  rowExpandedEvent.parameters.push(
    new ethereum.EventParam("newRow", ethereum.Value.fromUnsignedBigInt(newRow))
  )

  return rowExpandedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}
