import {
  FarmStarted as FarmStartedEvent,
  ResourcesClaimed as ResourcesClaimedEvent,
  ResourcesStolen as ResourcesStolenEvent
} from "../generated/FarmingV1/FarmingV1"
import { Farm, Token } from "../generated/schema"

export function handleFarmStarted(event: FarmStartedEvent): void {
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

export function handleResourcesClaimed(event: ResourcesClaimedEvent): void {
  let tokenId = event.params.tokenId.toString()
  let farm = Farm.load(tokenId)
  if (farm) {
    farm.lastClaim = event.block.timestamp
    // active bleibt true? Das hängt von deiner Logik ab.
    // Wenn Claimen das Farming nicht beendet, bleibt es aktiv.
    farm.save()
  }
}

export function handleResourcesStolen(event: ResourcesStolenEvent): void {
  // Hier könntest du z.B. einen Diebstahl vermerken, falls gewünscht.
  // Wir lassen es erstmal leer.
}