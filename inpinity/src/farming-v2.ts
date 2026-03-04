import { BigInt } from "@graphprotocol/graph-ts"
import {
  FarmStarted as FarmStartedEvent,
  ResourcesClaimed as ResourcesClaimedEvent,
  ResourcesStolen as ResourcesStolenEvent
} from "../generated/FarmingV2/FarmingV2"
import { FarmV2, ResourceClaimed, ResourceStolen } from "../generated/schema"

export function handleFarmStartedV2(event: FarmStartedEvent): void {
  let farm = new FarmV2(event.params.tokenId.toString())
  farm.startTime = event.params.startTime
  farm.lastClaim = event.params.startTime
  farm.active = true
  farm.save()
}

export function handleResourcesClaimedV2(event: ResourcesClaimedEvent): void {
  let farm = FarmV2.load(event.params.tokenId.toString())
  if (farm) {
    farm.lastClaim = event.block.timestamp
    farm.save()
  }

  let claimed = new ResourceClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  claimed.tokenId = event.params.tokenId
  // uint8 → BigInt konvertieren
  claimed.resourceId = BigInt.fromI32(event.params.resource)
  claimed.amount = event.params.amount
  claimed.blockNumber = event.block.number
  claimed.blockTimestamp = event.block.timestamp
  claimed.transactionHash = event.transaction.hash
  claimed.save()
}

export function handleResourcesStolenV2(event: ResourcesStolenEvent): void {
  let stolen = new ResourceStolen(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  stolen.tokenId = event.params.tokenId
  stolen.thief = event.params.attacker
  // uint8 → BigInt konvertieren
  stolen.resourceId = BigInt.fromI32(event.params.resource)
  stolen.amount = event.params.amount
  stolen.blockNumber = event.block.number
  stolen.blockTimestamp = event.block.timestamp
  stolen.transactionHash = event.transaction.hash
  stolen.save()
}