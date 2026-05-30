import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'mymart',
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: true,
})