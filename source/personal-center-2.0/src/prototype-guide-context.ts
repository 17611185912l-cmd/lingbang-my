import { createContext, useContext, useEffect, useId } from "react";

export type GuideSceneId =
  | "personal-closed" | "personal-open"
  | "membership-inactive" | "membership-active" | "membership-expired"
  | "purchase" | "purchase-success" | "support"
  | "promotion-users" | "promotion-rewards"
  | "voucher-history-used" | "voucher-history-expired"
  | "poster-parent" | "poster-teacher" | "poster-partner"
  | "application-regional" | "application-campus";
export type GuideFacts = Record<string, string | number>;
export type GuideScene = { id: GuideSceneId; facts: GuideFacts; layer: "page" | "overlay" };
export const PrototypeGuideContext = createContext<{
  register: (owner: string, scene: GuideScene) => void;
  remove: (owner: string) => void;
} | null>(null);

// Mounted background screens must unregister when they stop being current.
export function useGuideScene(id: GuideSceneId, active: boolean, facts: GuideFacts, layer: GuideScene["layer"] = "page") {
  const context = useContext(PrototypeGuideContext);
  if (!context) throw new Error("PrototypeGuideProvider is required");
  const { register, remove } = context;
  const owner = useId();
  const serializedFacts = JSON.stringify(facts);
  useEffect(() => {
    if (!active) return;
    register(owner, { id, facts: JSON.parse(serializedFacts) as GuideFacts, layer });
    return () => remove(owner);
  }, [id, active, serializedFacts, layer, owner, register, remove]);
}
