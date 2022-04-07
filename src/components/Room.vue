<template>
  <div>
    <router-link
      :to="{ name: 'room', params: room }"
      custom
      v-slot="{ navigate, isActive }"
    >
      <!-- <NavLink :active="isActive" :href="href" @click="navigate">
        {{ route.fullPath }}
      </NavLink> -->
      <ui-card class="room" :class="{ active: isActive }" @click="navigate">
        <ui-card-content>
          <div class="p-3">
            <h1 :class="$tt('caption')">{{ room.name }}</h1>
            <h1 :class="$tt('subtitle2')">-- sample --</h1>
          </div>
        </ui-card-content>
      </ui-card>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Vue, prop } from "vue-class-component";
import { RoomModel } from "../types/room.model";

class Props {
  room = prop<RoomModel>({ required: true });
}

export default class Room extends Vue.with(Props) {
  room_route = `/room/${this.room.id}`;
  click() {
    // this.$router.push();
  }
}
</script>
<style lang="scss" scoped>
@use "@material/theme" as color;
.room {
  &.active {
    // border-left: solid 3px color.$primary !important;
    background-color: #f0f2f5;
  }
}
</style>
