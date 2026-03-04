import {
    PartnerAdded as PartnerAddedEvent,
    PartnerTokenFound as PartnerTokenFoundEvent
  } from "../generated/PartnershipV2/PartnershipV2"
  import { Partnership } from "../generated/schema"
  
  export function handlePartnerAddedV2(event: PartnerAddedEvent): void {
    let partnership = new Partnership(event.params.partnerId.toString())
    partnership.name = event.params.name
    partnership.tokenAddress = event.params.tokenAddress
    partnership.blockId = event.params.blockId
    partnership.active = true
    partnership.save()
  }
  
  export function handlePartnerTokenFoundV2(event: PartnerTokenFoundEvent): void {
    // Optional: Hier könnte man eine Fund-Entität speichern
  }