import {writable} from "svelte/store";
import type {SvelteComponentDev} from "svelte/internal";

export const page = writable<{
  component: typeof SvelteComponentDev | null;
  params?: any;
}>({ component: null });
