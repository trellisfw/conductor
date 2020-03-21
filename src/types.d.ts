declare module '@trellisfw/signatures' {
  export function hashJSON (obj: object): { hash: string; alg: 'SHA256' }
}
