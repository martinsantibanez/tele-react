import { createLocalStorageStateHook } from "use-local-storage-state";
import { Source } from "../sources";

export const useFeaturedSource = createLocalStorageStateHook<
  Source | undefined
>("__tele_featured__");
