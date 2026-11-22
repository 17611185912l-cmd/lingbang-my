import { createContext, type PropsWithChildren, useContext, useEffect, useId, useRef, useState } from "react";
import { KeyboardInput, MobileScroll, useKeyboard } from "./mobile";
import { useGuideScene } from "./prototype-guide-context";

type ApplicationType = "regional" | "campus";
type ApplicationDraft = { name: string; phone: string; region: string; campus: string };
type DraftContextValue = { draft: ApplicationDraft; update: (field: keyof ApplicationDraft, value: string) => void };
const DraftContext = createContext<DraftContextValue | null>(null);

export function CreatorApplicationProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<ApplicationDraft>({ name: "", phone: "", region: "", campus: "" });
  return <DraftContext.Provider value={{ draft, update: (field, value) => setDraft(current => ({ ...current, [field]: value })) }}>{children}</DraftContext.Provider>;
}

export function CreatorApplication({ isCurrent, onBack }: { isCurrent: boolean; onBack: () => void }) {
  const context = useContext(DraftContext);
  if (!context) throw new Error("CreatorApplicationProvider is required");
  const { draft, update } = context;
  const keyboard = useKeyboard();
  const [type, setType] = useState<ApplicationType>("regional");
  const [feedback, setFeedback] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const campus = type === "campus";
  const title = campus ? "校园加盟" : "区域加盟";
  useGuideScene(campus ? "application-campus" : "application-regional", isCurrent, { 加盟类型: title, 姓名: draft.name.trim() ? "已填写" : "未填写", 手机号: draft.phone.trim() ? "已填写（说明不重复展示号码）" : "未填写", [campus ? "院校" : "区域"]: draft[campus ? "campus" : "region"].trim() ? "已填写" : "未填写", 提交状态: feedback ? "演示提交，未实际发送" : validationFailed ? "校验未通过，尚未提交" : "尚未提交" });
  const selectType = (next: ApplicationType) => {
    keyboard.hide();
    setType(next);
    setFeedback(false);
    setValidationFailed(false);
  };
  useEffect(() => {
    if (!isCurrent) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (keyboard.visible) keyboard.hide();
      else onBack();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [isCurrent, keyboard, onBack]);

  return <main className="creator-application-screen" aria-label="申请加盟" aria-hidden={!isCurrent} inert={!isCurrent}>
    <div className="creator-application-tabs" role="tablist" aria-label="加盟类型">
      {(["regional", "campus"] as const).map((value, index) => <button key={value} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${value}`} aria-selected={type === value} aria-controls={`${id}-panel`} tabIndex={type === value ? 0 : -1} onClick={() => selectType(value)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : index === 0 ? 1 : 0;
        selectType(next === 0 ? "regional" : "campus");
        tabs.current[next]?.focus();
      }}>{value === "regional" ? "区域加盟" : "校园加盟"}</button>)}
    </div>
    <div className="creator-application-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${type}`}>
      <MobileScroll className="creator-application-scroll">
        <div className="creator-application-content">
          <section className="creator-application-poster" aria-label="加盟招募海报">
            <p className="creator-application-brand">领榜家教 · 创客招募</p>
            <h2>{title}</h2>
            <p className="creator-application-tagline">{campus ? "让好教育走进校园" : "一起连接好教育"}</p>
            <p className="creator-application-audience">{campus ? "面向大学生群体" : "面向社会人员"}</p>
            <img className="creator-application-art" src={`/assets/creator-application/${type}.svg`} alt="" aria-hidden="true" draggable={false} />
          </section>
          <form className="creator-application-card" aria-labelledby={`${id}-form-title`} noValidate onInvalidCapture={() => setValidationFailed(true)} onSubmit={event => {
            event.preventDefault();
            const form = event.currentTarget;
            form.querySelectorAll<HTMLInputElement>("input:not(:disabled)").forEach(input => input.setCustomValidity(input.value.trim() ? "" : "请填写此字段"));
            if (!form.reportValidity()) return;
            setValidationFailed(false);
            Object.entries(draft).forEach(([field, value]) => update(field as keyof ApplicationDraft, value.trim()));
            keyboard.hide();
            setFeedback(true);
          }}>
            <h2 id={`${id}-form-title`}>填写加盟信息</h2>
            <p className="creator-application-card-intro">请填写以下信息，便于我们与你联系</p>
            {([
              { field: "name", label: "姓名", placeholder: "请输入姓名", maxLength: 20, autoComplete: "name" },
              { field: "phone", label: "手机号", placeholder: "请输入11位手机号", maxLength: 11, autoComplete: "tel-national" },
              { field: "region", label: "区域", placeholder: "如：陕西省西安市雁塔区", maxLength: 50 },
              { field: "campus", label: "院校", placeholder: "请输入院校名称", maxLength: 50 },
            ] as const).map(item => {
              const hidden = item.field === "region" && campus || item.field === "campus" && !campus;
              return <label className="creator-application-field" key={item.field} hidden={hidden} htmlFor={`${id}-${item.field}`}>
                <span>{item.label}<em aria-hidden="true">*</em></span>
                <KeyboardInput id={`${id}-${item.field}`} name={item.field} type={item.field === "phone" ? "tel" : "text"} inputMode={item.field === "phone" ? "numeric" : "text"} autoComplete={"autoComplete" in item ? item.autoComplete : "off"} placeholder={item.placeholder} maxLength={item.maxLength} pattern={item.field === "phone" ? "1[3-9][0-9]{9}" : undefined} title={item.field === "phone" ? "请输入11位中国大陆手机号" : undefined} required disabled={hidden} value={draft[item.field]} onChange={event => {
                  event.currentTarget.setCustomValidity("");
                  update(item.field, event.currentTarget.value);
                  setFeedback(false);
                  setValidationFailed(false);
                }} onBlur={event => {
                  if (!(event.relatedTarget instanceof HTMLInputElement) || !event.currentTarget.form?.contains(event.relatedTarget)) keyboard.hide();
                }} />
              </label>;
            })}
            <button type="submit" className="creator-application-submit" onPointerDown={event => {
              // Keep input blur from moving the button before the click completes.
              // Pointer events still bubble to MobileScroll for drag suppression.
              if (event.button === 0) event.preventDefault();
            }}>提交申请</button>
            {feedback && <p className="creator-application-feedback" role="status">当前为演示，申请未实际提交。</p>}
          </form>
        </div>
      </MobileScroll>
    </div>
  </main>;
}
