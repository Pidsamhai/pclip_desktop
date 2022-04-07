<template>
  <UpdaterDialog
    v-model:manifest="manifest"
    v-model:dialog="openUpdater"
    @install="install()"
  />
  <ui-snackbar v-model="showError" message="Install update error"></ui-snackbar>
  <router-view></router-view>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import UpdaterDialog from "./components/UpdaterDialog.vue";
import {
  checkUpdate,
  installUpdate,
  UpdateManifest,
} from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
@Options({
  components: { UpdaterDialog },
})
export default class App extends Vue {
  manifest: UpdateManifest | null = null;
  openUpdater = false;
  showError = false;
  async updaterCheck() {
    try {
      const { manifest } = await checkUpdate();
      console.log(manifest);
      this.manifest = manifest ?? null;
      this.openUpdater = true;
    } catch (error) {
      console.error(error);
    }
  }
  async install() {
    try {
      await installUpdate();
      await relaunch();
    } catch (error) {
      console.error(error);
      this.showError = !this.showError;
    }
  }
  beforeMount() {
    this.updaterCheck();
  }
}
</script>
<style lang="scss">
body,
html {
  padding: 0;
  margin: 0;
}
</style>
