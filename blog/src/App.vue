<template>
  <div class="content">
   
    <div class="page">
      <div class="view-content">
        <router-view />
      </div>
      <div class="page-footer">
        <svg-image></svg-image>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SvgImage from './components/SvgImage.vue'

export default defineComponent({
  name: 'App',
  components: {
    SvgImage,
  }
})
</script>

<style>
  *{ margin: 0;padding:0 }
  body,html,#app ,.content{width: 100%;height:100%}
  body{
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
  }
  .content {
    display: flex;
    justify-content: space-between;
  }
  .page {
    width: 100%;
    height: 100%;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(1600px at 70% 120%, rgba(33, 39, 80, 1) 10%, #020409 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
