import {
  PartnerAdded as PartnerAddedEvent,
  PartnerTokenFound as PartnerTokenFoundEvent
} from "../generated/PartnershipV1/PartnershipV1"
import { Partnership } from "../generated/schema"

export function handlePartnerAdded(event: PartnerAddedEvent): void {
  let partnerId = event.params.partnerId.toString()
  let partnership = new Partnership(partnerId)
  partnership.name = event.params.name
  partnership.tokenAddress = event.params.tokenAddress
  partnership.blockId = event.params.blockId
  partnership.active = true
  partnership.save()
}

export function handlePartnerTokenFound(event: PartnerTokenFoundEvent): void {
  // Optional: Hier könntest du später eine Entität für Funde anlegen
}