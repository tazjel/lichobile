// Type definitions for Apache Cordova Universal/Deep Links plugin.
// Project: https://github.com/nordnet/cordova-universal-links-plugin
// Definitions by: Mark Henle <https://github.com/freefal>

/**
* Global object universalLinks.
*/
interface Window {
  universalLinks: UniversalLinks;
}

interface EventData {
  url: string
  scheme: string
  host: string
  path: string
  params: string
  hash: string
}

/**
* The universalLinks object allows us to subscribe to events that have been mapped from urls in config.xml.
*/
interface UniversalLinks {
  subscribe: (event: string, action: (eventData: EventData) => void) => void
}
