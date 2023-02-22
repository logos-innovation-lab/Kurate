import { writable } from 'svelte/store'
import router from 'page'

export const page = writable({
  component: null,
  props: {}
})

router('/', () =>
  import(/* webpackChunkName: "index" */ './routes/+page.svelte').then(module =>
    page.set({ component: module.default })
  )
)

export default router