/* eslint-disable import/export */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { encodeMessage, decodeMessage, message } from 'protons-runtime'
import type { Codec } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'

export interface Post {
  text: string
  fullProof?: FullProof
}

export namespace Post {
  let _codec: Codec<Post>

  export const codec = (): Codec<Post> => {
    if (_codec == null) {
      _codec = message<Post>((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork()
        }

        if ((obj.text != null && obj.text !== '')) {
          w.uint32(10)
          w.string(obj.text)
        }

        if (obj.fullProof != null) {
          w.uint32(794)
          FullProof.codec().encode(obj.fullProof, w)
        }

        if (opts.lengthDelimited !== false) {
          w.ldelim()
        }
      }, (reader, length) => {
        const obj: any = {
          text: ''
        }

        const end = length == null ? reader.len : reader.pos + length

        while (reader.pos < end) {
          const tag = reader.uint32()

          switch (tag >>> 3) {
            case 1:
              obj.text = reader.string()
              break
            case 99:
              obj.fullProof = FullProof.codec().decode(reader, reader.uint32())
              break
            default:
              reader.skipType(tag & 7)
              break
          }
        }

        return obj
      })
    }

    return _codec
  }

  export const encode = (obj: Partial<Post>): Uint8Array => {
    return encodeMessage(obj, Post.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): Post => {
    return decodeMessage(buf, Post.codec())
  }
}

export interface FullProof {
  merkleTreeRoot: Uint8Array
  nullifierHash: Uint8Array
  signal: Uint8Array
  externalNullifier: Uint8Array
  proof: Uint8Array[]
}

export namespace FullProof {
  let _codec: Codec<FullProof>

  export const codec = (): Codec<FullProof> => {
    if (_codec == null) {
      _codec = message<FullProof>((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork()
        }

        if ((obj.merkleTreeRoot != null && obj.merkleTreeRoot.byteLength > 0)) {
          w.uint32(10)
          w.bytes(obj.merkleTreeRoot)
        }

        if ((obj.nullifierHash != null && obj.nullifierHash.byteLength > 0)) {
          w.uint32(18)
          w.bytes(obj.nullifierHash)
        }

        if ((obj.signal != null && obj.signal.byteLength > 0)) {
          w.uint32(26)
          w.bytes(obj.signal)
        }

        if ((obj.externalNullifier != null && obj.externalNullifier.byteLength > 0)) {
          w.uint32(34)
          w.bytes(obj.externalNullifier)
        }

        if (obj.proof != null) {
          for (const value of obj.proof) {
            w.uint32(42)
            w.bytes(value)
          }
        }

        if (opts.lengthDelimited !== false) {
          w.ldelim()
        }
      }, (reader, length) => {
        const obj: any = {
          merkleTreeRoot: new Uint8Array(0),
          nullifierHash: new Uint8Array(0),
          signal: new Uint8Array(0),
          externalNullifier: new Uint8Array(0),
          proof: []
        }

        const end = length == null ? reader.len : reader.pos + length

        while (reader.pos < end) {
          const tag = reader.uint32()

          switch (tag >>> 3) {
            case 1:
              obj.merkleTreeRoot = reader.bytes()
              break
            case 2:
              obj.nullifierHash = reader.bytes()
              break
            case 3:
              obj.signal = reader.bytes()
              break
            case 4:
              obj.externalNullifier = reader.bytes()
              break
            case 5:
              obj.proof.push(reader.bytes())
              break
            default:
              reader.skipType(tag & 7)
              break
          }
        }

        return obj
      })
    }

    return _codec
  }

  export const encode = (obj: Partial<FullProof>): Uint8Array => {
    return encodeMessage(obj, FullProof.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): FullProof => {
    return decodeMessage(buf, FullProof.codec())
  }
}
