import { SupabaseClient } from "@supabase/supabase-js";
import { MessageModel, MessageRequest } from "../types/message.model";
import { observeWrapper } from "../utils/realtime-wrapper";
import { MessageEncrypter } from "../utils/message-encrypter";
import client from "../lib/supabase";
import { RoomModel } from "../types/room.model";

export class RoomService {
  private roomId: string;
  constructor(roomId: string) {
    this.roomId = roomId;
  }

  async sendMessage(roomId: string, msg: string, encrypter: MessageEncrypter) {
    const encryptMessage = encrypter.encrypt(msg);
    await client.from("room_message").insert(<MessageRequest>{
      message: encryptMessage.toString(),
      room_id: roomId,
    });
  }

  async deleteMessage(messageId: string) {
    await client
      .from("room_message")
      .delete({ returning: "minimal" })
      .eq("id", messageId);
  }

  async getRoom(): Promise<RoomModel> {
    const reslut = await client
      .from("room")
      .select()
      .eq("id", this.roomId)
      .single();
    return reslut.data as RoomModel;
  }

  async messageObserver(
    roomId: string,
    encroter: MessageEncrypter,
    callback: (change: Array<MessageModel>) => void
  ) {
    return observeWrapper<MessageModel>(
      client.from("room_message").select().eq("room_id", roomId),
      client.from(`room_message:room_id=eq.${roomId}`),
      callback,
      (n, old) => n.id === old.id,
      (data) => {
        data.message = encroter.decrypt(data.message);
        return data;
      }
    );
  }

  async leaveRoom(): Promise<boolean> {
    try {
      await new Promise((reslove) => setTimeout(reslove, 3000));
      const result = await client
        .from("room_member")
        .delete({ returning: "minimal" })
        .eq("room_id", this.roomId)
        .eq("member_id", client.auth.user()?.id);
      return result.error == null;
    } catch (error) {
      return false;
    }
  }
}
