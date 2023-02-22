<svelte:component this={$page.component} {...$page.props} />
<script>
    import '@fontsource/source-code-pro'
    import '@fontsource/source-sans-pro'
    import '@fontsource/source-serif-pro'
    import './routes/styles.css'
    import router from './router'
    import {page} from "./lib/stores/route"

    router.start()
</script>