# Kurate ReadMe


## Summary

There are two distinct ways of describing Kurate depending on Player story. One is from the perspective of **Creators**, the other from the perspective of **Curators**. 

**Creators**: Create public content anonymously through online masks called Personas.

From this perspective, Kurate is an anonymous social media platform where creators remain private, but post publicly through group identities known as Personas. Creators earn reputation (REP) when Curators vote to Promote their posts.

**Curators**: Communities anonymously curate content together.

From this perspective, Kurate is a privacy-enabled group curation application, where people vote on whether a post is in the character of their group identity (known as a Persona). Curators earn reputation (REP) when they vote in-line with the majority of their community.

## Kurate: How To Play The Game
Players will experience what it's like remain private, but "play" as a public group identity we call a Persona. Players speak "through" or "as" a Persona.

Sometimes a Persona may "look like" a brand. Sometimes a Persona may "look like" an individual. To play as a Persona means to post content one believes is appropriate for the character of the Persona. 

**Create a post**

A Player looking to submit a post would ask themselves: "What types of things would this Persona share and amplify if they were a real person, with a real identity?" And then post accordingly. Another question might be "What types of content reflect the character of the community speaking through this Persona?"

**Curate posts**

Players help curate content that is "appropriate for the Persona" by voting on whether or not to amplify others' posts. If the community deems a post appropriate, it will be amplified to the Persona's main public page.

**Reputation**

Players earn reputation by posting and curating. For example, a Player whose posts are deemed appropriate by the community will gain reputation. And a Player who votes on a post in the same direction as the majority of voters will also earn reputation.

**What Players can do in Kurate**:
- Post anonymously as a Persona.
- Vote on the appropriateness of a post from another Player.
- Stake reputation on a Post — earning reputation if the community votes to amplify it.
- Earn reputation through curating community-appropriate posts.
- Anonymously Chat
- Create a Persona

## Privacy with accountability 

Players who post remain anonymous, but the community decides whether or not to amplify their post. This allows privacy for the Player with community accountability.

Also, curating and creating Players earn reputation (REP) for positive gameplay (acting in-line with the values of a community). The more REP a Player has, the more they may do in Kurate.

## Technology
We are using ZK-Proof technology and [Waku](https://waku.org/) to ensure privacy, with a hat-tip to [Unirep](https://medium.com/privacy-scaling-explorations/unirep-a-private-and-non-repudiable-reputation-system-7fb5c6478549), and [Semaphore](https://semaphore.appliedzkp.org/).

## For Developers

0. Install all dependencies
```sh
pnpm i
```

1. Start blockchain and deploy contracts
```sh
cd packages/contracts
```

```sh
pnpm start:blockchain
```

In another terminal window, compile, deploy the contracts
```
pnpm start
```

If successfully, the output should say:
```
GlobalAnonymousFeedContract contract has been deployed
Don't forget to set the variables for both the UI and relayer

PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS=0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
PUBLIC_PROVIDER=http://localhost:8545

Relayer only
PRIVATE_KEY=...

UI only
PUBLIC_RELAYER_URL=...
```

2. Start relayer
```sh
cd packages/contracts
```
Set the environment variables according to the contract deployment (for private key you can use any hardhat key). Should be:
```sh
PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS=0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
PUBLIC_PROVIDER=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Build and start the relayer
```
pnpm build
pnpm start
```

3. Start UI
```sh
cd packages/ui
```

Set the environment variables according to the contract deployment and where the relayer lives: Should be: 
```sh
PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS=0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
PUBLIC_PROVIDER=http://localhost:8545
PUBLIC_RELAYER_URL=http://localhost:3000
```

Start the UI with
```sh
pnpm dev
```

You can now open the app at http://localhost:5173/ . Just make sure you are using either the `zkitter` or the `zkitter-god-node` adapter. You can configure those in `/dev` route (http://localhost:5173/dev)

**Are you interested in contributing to Kurate?**




