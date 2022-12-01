<script lang="ts">
	import Avatar from '$lib/components/avatar.svelte'
	import Button from '$lib/components/button.svelte'
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import GroupSecurity from '$lib/components/icons/group-security.svelte'
	import UpToTop from '$lib/components/icons/up-to-top.svelte'
	import User from '$lib/components/icons/user.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import img1 from '$lib/temp/assets/1.png'
</script>

<h2>Buttons</h2>
<Button label="primary" variant="primary" />
<Button label="secondary" variant="secondary" />
<Button label="primary icon" variant="primary" icon={UpToTop} />
<Button label="secondary icon" variant="secondary" icon={UpToTop} />
<Button variant="primary" icon={UpToTop} />
<Button variant="secondary" icon={UpToTop} />

<h2>Icons</h2>

<UpToTop />
<User />
<Wallet />
<GroupSecurity />
<ArrowRight />
<Close />

<h2>Avatar</h2>

<Avatar />
<Avatar src={img1} />
