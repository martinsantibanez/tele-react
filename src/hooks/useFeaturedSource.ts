import { createLocalStorageStateHook } from "use-local-storage-state";

export const useFeaturedSource = createLocalStorageStateHook<
  string | undefined
>("__tele_featured__");
