/*
import { test } from 'tap'
import { build } from '../helper'

test('default root route', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/'
  })
  t.same(JSON.parse(res.payload), { root: true })
})
*/

/*
import { Registry } from "rlnjs";
import { getInstance } from "../../src/services/rln";

(async () => {
  const rlnRegistry = new Registry(20);
  const instance = getInstance();
  rlnRegistry.addMember(instance.commitment);

  const merkleProof = rlnRegistry.generateMerkleProof(instance.commitment);
  console.log(merkleProof);
  const proof = await getInstance().generateProof(
    "test",
    merkleProof,
    BigInt(20)
  );
  console.log(proof, proof.snarkProof);
  console.log(
    JSON.stringify(proof, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
})();
*/
