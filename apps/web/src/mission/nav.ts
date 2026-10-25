export type ViewKind = 'item' | 'bill' | 'pay' | 'terms' | 'person' | 'option' | 'list';
export interface View { kind: ViewKind; id: string }
/** `open` replaces the sheet stack; `push` drills deeper; `pop` returns one level. */
export interface Nav { open: (v: View) => void; push: (v: View) => void; pop: () => void; close: () => void }
