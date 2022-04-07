<template>
  <ui-dialog
    :modelValue="dialog"
    :maskClosable="!isLoading"
    @update:modelValue="$emit('update:dialog', $event)"
    @close="onClose()"
  >
    <ui-dialog-title>Room Setting</ui-dialog-title>
    <ui-dialog-content>
      <div class="flex flex-col gap-4 items-start !w-[500px]">
        <ui-textfield minlength="6" v-model="roomName" class="w-full">
          Room Name
        </ui-textfield>
        <ui-textfield minlength="6" v-model="roomSecret" class="w-full">
          Room Secrets
        </ui-textfield>
        <p>Members</p>
        <MemberCard
          v-for="member in members"
          :member="member"
          :key="member.member_id"
        />
        <div class="self-end">
          <ui-button
            :class="$theme.getThemeClass('error')"
            :disabled="isLoading"
            @click="leaveRoom()"
          >
            Leave
            <template #before v-if="isLoading">
              <ui-spinner class="mr-1" size="S" active></ui-spinner>
            </template>
          </ui-button>
          <ui-button
            :disabled="isLoading"
            @click="$emit('update:dialog', false)"
            >Close</ui-button
          >
          <ui-button :disabled="isLoading" @click="onConfirm()">
            Save
            <template #before v-if="isLoading">
              <ui-spinner class="mr-1" size="S" active></ui-spinner>
            </template>
          </ui-button>
        </div>
      </div>
    </ui-dialog-content>
    <!-- <ui-dialog-actions>

    </ui-dialog-actions> -->
  </ui-dialog>
</template>

<script lang="ts">
import { RealtimeSubscription } from "@supabase/supabase-js";
import { Vue, Options, prop } from "vue-class-component";
import { MemberModel } from "../types/member.model";
import { RoomModel } from "../types/room.model";
import Pin from "./Pin.vue";
import MemberCard from "./MemberCard.vue";
import { RoomService } from "../services/room.service";
import { Events } from "../types/events";

class Props {
  dialog = prop<Boolean>({ default: false });
  id = prop<string>({ required: true });
}

@Options({
  components: { Pin, MemberCard },
})
export default class JoinRoomDialog extends Vue.with(Props) {
  isLoading = false;
  roomName = "";
  roomSecret = "";
  room?: RoomModel;
  subscribe: RealtimeSubscription | null = null;
  members: Array<MemberModel> = [];
  roomService: RoomService = new RoomService(this.id);
  onClose() {
    // this.roomName = "";
    // this.roomSecret = "";
  }
  async onConfirm() {
    this.isLoading = true;
    await new Promise((reslove) => setTimeout(reslove, 2000));
    this.isLoading = false;
    this.$emit("update:dialog", false);
  }
  async leaveRoom() {
    this.isLoading = true;
    const success = await this.roomService.leaveRoom();
    this.isLoading = false;
    if (success) {
      this.$eventbus.emit(Events.REFRESH_ROOMS, true);
      this.$router.replace("/");
    }
  }
  async mounted() {
    this.room = await this.roomService.getRoom();
    this.roomSecret = localStorage.getItem(this.id) ?? "";
    console.log(this.room);
    this.roomName = this.room.name;
    console.debug("Dialog Mounted", this.id);
    this.subscribe = await this.$sbs.observeMembers(
      this.room.id!,
      (n) => (this.members = n)
    );
  }
  unmounted() {
    this.subscribe?.unsubscribe();
    console.debug("Dialog unmounted", this.room?.id);
  }
}
</script>
