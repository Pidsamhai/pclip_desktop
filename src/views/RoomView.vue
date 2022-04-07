<template>
  <RoomSettingDialog v-model:dialog="openSetting" :id="room?.id" />
  <div
    class="flex flex-col gap-3 h-full"
    :class="$tt('body2')"
    ref="conversations"
  >
    <div
      class="flex flex-col gap-3 h-full overflow-y-scroll"
      :class="$tt('body2')"
      ref="conversations"
    >
      <template v-for="message in messages" :key="message.id">
        <MessageBuble
          :message="message"
          @onDelete="deleteMessage(message.id)"
        />
      </template>
    </div>
    <div class="flex flex-row gap-2 w-full items-end">
      <ui-icon-button
        @click="openSetting = true"
        :class="$theme.getThemeClass('primary')"
        icon="settings"
      ></ui-icon-button>
      <ui-textfield
        v-model="messageInput"
        v-on:input="inputCallBack($event)"
        inputId="conInput"
        input-type="textarea"
        class="!w-full !max-h-[100px]"
      >
        Aa
      </ui-textfield>
      <ui-icon-button
        @click="sendMessage()"
        icon="send"
        :class="$theme.getThemeClass('primary')"
      ></ui-icon-button>
    </div>
  </div>
</template>

<script lang="ts">
import { RealtimeSubscription } from "@supabase/supabase-js";
import { Vue, Options, prop } from "vue-class-component";
import RoomSettingDialog from "../components/RoomSettingDialog.vue";
import { MessageModel } from "../types/message.model";
import MessageBuble from "../components/MessageBuble.vue";
import { MessageEncrypter } from "../utils/message-encrypter";
import { RoomModel } from "../types/room.model";
import { RoomService } from "../services/room.service";

@Options({
  components: { RoomSettingDialog, MessageBuble },
})
export default class RoomVue extends Vue {
  room?: RoomModel;
  openSetting = false;
  subscribe?: RealtimeSubscription;
  messages: Array<MessageModel> = [];
  encrypter?: MessageEncrypter;
  roomService: RoomService = new RoomService(this.room?.id!);
  messageInput = "";
  declare $refs: {
    conversations: HTMLDivElement;
  };
  isLoading = false;
  async toggleLoader() {
    this.isLoading = !this.isLoading;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.isLoading = !this.isLoading;
  }
  onChange(change: Array<MessageModel>) {
    this.messages = change;
  }
  inputCallBack(event: Event) {
    const textArea = event.target as HTMLTextAreaElement | null;
    if (textArea != null) {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  }
  sendMessage() {
    this.roomService.sendMessage(
      this.room!.id,
      this.messageInput,
      this.encrypter!
    );
    this.messageInput = "";
  }
  deleteMessage(id: string) {
    this.roomService.deleteMessage(id);
  }
  created() {
    this.room = this.$route.params as unknown as RoomModel;
    console.log("Create", this.room!.id);
    const secret = localStorage.getItem(this.room!.id)!;
    this.encrypter = new MessageEncrypter(secret, this.room!.iv);
  }
  async mounted() {
    this.$refs.conversations.scrollTop = this.$refs.conversations.scrollHeight;
    this.subscribe = await this.roomService.messageObserver(
      this.room!.id,
      this.encrypter!,
      this.onChange
    );
  }
  unmounted() {
    this.subscribe?.unsubscribe();
  }
  updated() {}
}
</script>
<style lang="scss" scoped>
textarea {
  resize: none;
}
</style>
