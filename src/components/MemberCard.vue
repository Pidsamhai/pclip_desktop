<template>
  <ui-card class="w-full" v-ripple v-shadow="2">
    <ui-card-content>
      <div class="p-3">
        <h1 :class="$tt('body1')">{{ member.device_name }}</h1>
        <h1 :class="$tt('body2')">{{ member.member_id }}</h1>
      </div>
    </ui-card-content>
  </ui-card>
</template>

<script lang="ts">
import { Vue, prop } from "vue-class-component";
import { MemberModel } from "../types/member.model";
class Props {
  member = prop<MemberModel>({ required: true });
}
export default class MemberCard extends Vue.with(Props) {}
</script>
