<template>
  <UserInfoDialog v-model:dialog="openUserDialog" />
  <JoinRoomDialog
    v-model:dialog="openJoinRoomDialog"
    @onConfirm="joinRoom($event)"
  />
  <progress-dialog v-model:dialog="isLoading" />
  <div class="hall-container">
    <ui-top-app-bar
      content-selector=".hall-content"
      :nav-icon="false"
      :type="0"
    >
      <p class="hover:cursor-pointer" @click="$router.push('/')">Pclip</p>
      <template #toolbar="{ toolbarItemClass }">
        <ui-icon-button
          @click="openUserDialog = true"
          :class="toolbarItemClass"
          icon="person"
        ></ui-icon-button>
      </template>
    </ui-top-app-bar>
    <div class="hall-content">
      <ui-drawer viewport-height>
        <ui-drawer-header>
          <!-- <ui-drawer-title>Room</ui-drawer-title> -->
          <div class="flex flex-row justify-between items-center h-full">
            <p :class="$tt('headline6')">Room</p>
            <ui-icon-button
              :class="$theme.getThemeClass('primary')"
              @click="openJoinRoomDialog = true"
              icon="add_circle"
            ></ui-icon-button>
          </div>
        </ui-drawer-header>
        <ui-divider></ui-divider>
        <ui-drawer-content>
          <div
            v-if="rooms.length === 0"
            class="h-full flex justify-center items-center flex-col gap-2"
          >
            <p>No room avilable</p>
            <ui-button @click="openJoinRoomDialog = true" icon="add_circle"
              >Join room</ui-button
            >
          </div>
          <div v-if="rooms.length != 0">
            <div v-for="room in rooms" :key="room.id" class="flex flex-col">
              <Room :room="room" />
            </div>
          </div>
        </ui-drawer-content>
      </ui-drawer>
      <!-- App content -->
      <div class="demo-app-content w-full h-full p-2">
        <router-view :key="$route.params.id" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { RealtimeSubscription } from "@supabase/realtime-js";
import { Vue, Options } from "vue-class-component";
import Room from "../components/Room.vue";
import UserInfoDialog from "../components/UserInfoDialog.vue";
import { RoomModel } from "../types/room.model";
import JoinRoomDialog from "../components/JoinRoomDialog.vue";
import { Events } from "../types/events";

@Options({
  components: { Room, UserInfoDialog, JoinRoomDialog },
})
export default class MainView extends Vue {
  openUserDialog = false;
  openJoinRoomDialog = false;
  isLoading = false;
  rooms: Array<RoomModel> = [];
  subscribe: RealtimeSubscription | null = null;
  onChange(change: Array<RoomModel>) {
    this.rooms = change;
  }
  async subscribeRoom() {
    this.subscribe = await this.$sbs.observeRooms(this.onChange);
  }
  unSubscribeRoom() {
    this.subscribe?.unsubscribe();
  }
  async created() {
    await this.subscribeRoom();
  }
  mounted() {
    this.$eventbus.on(Events.REFRESH_ROOMS, (_) => {
      this.unSubscribeRoom();
      this.subscribeRoom();
    });
  }
  unmounted() {
    console.debug("Unsubcribe");
    this.unSubscribeRoom();
  }
  singOut() {
    this.$sbs.singOut();
  }
  async joinRoom(secret: { code: string; secret: string }) {
    try {
      await this.$apiService.joinRoom(
        secret.code,
        secret.secret,
        this.$sbs.accessToken()!
      );
    } finally {
      this.isLoading = false;
    }
  }
}
</script>
