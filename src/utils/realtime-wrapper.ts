import { RealtimeSubscription } from "@supabase/supabase-js";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { SupabaseQueryBuilder } from "@supabase/supabase-js/dist/module/lib/SupabaseQueryBuilder";

export async function observeWrapper<T>(
  init: PostgrestFilterBuilder<any>,
  from: SupabaseQueryBuilder<any>,
  callback: ObserveCallBack<T>,
  diff: (n: T, old: any) => boolean,
  compute?: (data: T) => T
): Promise<RealtimeSubscription> {
  const { data } = await init;
  let currentData: Array<T> = data?.map((e) => e as T) ?? [];
  callback(compute ? currentData.map((e) => compute(e)) : currentData);
  return from
    .on("*", (snapshot) => {
      console.debug(
        `Snapshot: ${snapshot.eventType}`,
        snapshot.new,
        snapshot.old
      );
      switch (snapshot.eventType) {
        case "INSERT": {
          const e = snapshot.new as T;
          currentData.push(compute ? compute(e) : e);
          break;
        }
        case "DELETE": {
          currentData = currentData.filter((e) => !diff(e, snapshot.old));
          break;
        }
        case "UPDATE": {
          const e = snapshot.new as T;
          const index = currentData.findIndex((e) => diff(e, snapshot.old));
          currentData[index] = compute ? compute(e) : e;
          break;
        }
        default:
          break;
      }
      callback([...currentData]);
    })
    .subscribe();
}

export type ObserveCallBack<T> = (change: Array<T>) => void;
