import { BigInt } from "@graphprotocol/graph-ts"

import {
  FarmStarted,
  FarmStopped,
  BoostBought,
  ResourcesClaimed,
  ResourcesStolen
} from "../generated/FarmingV5/FarmingV5"

import {
  FarmV5,
  FarmingBoostV5,
  ClaimV5,
  StealV5
} from "../generated/schema"

function farmId(tokenId: BigInt): string {
  return tokenId.toString()
}

export function handleFarmStartedV5(event: FarmStarted): void {
  let id = farmId(event.params.tokenId)
  let farm = FarmV5.load(id)

  if (farm == null) {
    farm = new FarmV5(id)
    farm.active = false
  }

  farm.owner = event.params.owner
  farm.startTime = event.params.startTime
  farm.active = true
  farm.updatedAt = event.block.timestamp
  farm.blockNumber = event.block.number
  farm.transactionHash = event.transaction.hash
  farm.save()
}

export function handleFarmStoppedV5(event: FarmStopped): void {
  let id = farmId(event.params.tokenId)
  let farm = FarmV5.load(id)

  if (farm == null) {
    farm = new FarmV5(id)
    farm.active = false
  }

  farm.stopTime = event.params.stopTime
  farm.active = false
  farm.updatedAt = event.block.timestamp
  farm.blockNumber = event.block.number
  farm.transactionHash = event.transaction.hash
  farm.save()
}

export function handleBoostBoughtV5(event: BoostBought): void {
  let entity = new FarmingBoostV5(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.tokenId = event.params.tokenId
  entity.owner = event.params.owner
  entity.daysAmount = event.params.daysAmount
  entity.cost = event.params.cost
  entity.newExpiry = event.params.newExpiry
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let id = farmId(event.params.tokenId)
  let farm = FarmV5.load(id)

  if (farm == null) {
    farm = new FarmV5(id)
    farm.active = false
  }

  farm.owner = event.params.owner
  farm.boostExpiry = event.params.newExpiry
  farm.updatedAt = event.block.timestamp
  farm.blockNumber = event.block.number
  farm.transactionHash = event.transaction.hash
  farm.save()
}

export function handleResourcesClaimedV5(event: ResourcesClaimed): void {
  let entity = new ClaimV5(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.tokenId = event.params.tokenId
  entity.owner = event.params.owner
  entity.resourceIds = event.params.resourceIds
  entity.amounts = event.params.amounts
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let id = farmId(event.params.tokenId)
  let farm = FarmV5.load(id)

  if (farm == null) {
    farm = new FarmV5(id)
    farm.active = false
  }

  farm.owner = event.params.owner
  farm.lastClaimTime = event.block.timestamp
  farm.updatedAt = event.block.timestamp
  farm.blockNumber = event.block.number
  farm.transactionHash = event.transaction.hash
  farm.save()
}

export function handleResourcesStolenV5(event: ResourcesStolen): void {
  let entity = new StealV5(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.targetTokenId = event.params.targetTokenId
  entity.attacker = event.params.attacker
  entity.resourceId = event.params.resourceId
  entity.amount = event.params.amount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}