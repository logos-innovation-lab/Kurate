import router from 'page'
import {ROUTES} from "./lib/routes";
import {page} from "./lib/stores/route";

router(ROUTES.HOME, ctx =>{
  return import(/* webpackChunkName: "index" */ './routes/+page.svelte').then(module =>
    page.set({ component: module.default })
  )
})

router(ROUTES.PROFILE, ctx =>{
  return import(/* webpackChunkName: "index" */ './routes/profile/+page.svelte').then(module =>
    page.set({ component: module.default })
  )
})

router(ROUTES.PERSONA_NEW, ctx =>{
  return import(/* webpackChunkName: "index" */ './routes/persona/new/+page.svelte').then(module =>
    page.set({ component: module.default })
  )
})

router(ROUTES.PERSONA(':groupId'), (ctx) => {
  return import(/* webpackChunkName: "index" */ './routes/persona/[id]/+page.svelte').then(module =>
    page.set({
      component: module.default,
      params: ctx.params,
    })
  )
})

router(ROUTES.PERSONA_DRAFT(':id'), (ctx) => {
  return import(/* webpackChunkName: "index" */ './routes/persona/draft/[id]/+page.svelte').then(module =>
    page.set({
      component: module.default,
      params: ctx.params,
    })
  )
})

router(ROUTES.POST_NEW(':id'), (ctx) => {
  return import(/* webpackChunkName: "index" */ './routes/persona/[id]/post/new/+page.svelte').then(module =>
    page.set({
      component: module.default,
      params: ctx.params,
    })
  )
})

export default router