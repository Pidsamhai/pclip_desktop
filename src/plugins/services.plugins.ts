import { App } from "vue";
import { ApiService } from "../services/api.service";
import { SupabaseServices } from "../services/supabase.service";
import client from "../lib/supabase";
import { RoomService } from "../services/room.service";

export default {
  install: (app: App) => {
    app.config.globalProperties.$apiService = new ApiService();
    app.config.globalProperties.$sbs = new SupabaseServices(client);
    app.config.globalProperties.$roomService = new RoomService(client);
  },
};

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $apiService: ApiService;
    $sbs: SupabaseServices;
    $roomService: RoomService;
  }
}
