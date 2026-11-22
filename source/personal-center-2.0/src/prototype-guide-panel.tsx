import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import rawSpec from "./spec/prototype-spec.json";
import { type GuideScene } from "./prototype-guide-context";
import "./prototype-guide.css";

type Requirement = { id: string; area: string; title: string; basis: string; implementation: string };
type AcceptanceCase = { id: string; requirements: string[]; stage: string; given: string; when: string; then: string };
type SpecSection = { id: string; title: string; requirements: string[]; summary: string; sources: string[]; actions: string[][]; fields: string[][]; states: string[][]; rules: string[]; cases: AcceptanceCase[] };
type Spec = { metadata: { title: string; baseVersion: string; revision: string; updated: string; intro: string }; requirements: Requirement[]; sections: SpecSection[]; contexts: { id: string; title: string; sections: string[] }[] };
const spec = rawSpec as Spec;
const sectionsById = new Map(spec.sections.map(section => [section.id, section]));
const documentUrl = "/docs/原型开发与测试说明.html";


function DefinitionRows({ rows, labels }: { rows: string[][]; labels: string[] }) {
  return <dl className="prototype-guide-definitions">{rows.map((row, index) => <div key={`${index}-${row[0]}`}>
    <dt>{row[0]}</dt>
    <dd>{row.slice(1).map((value, i) => <p key={i}><b>{labels[i + 1]}：</b>{value}</p>)}</dd>
  </div>)}</dl>;
}
function SectionNotes({ section }: { section: SpecSection }) {
  return <section className="prototype-guide-section" data-guide-section={section.id}>
    <div className="prototype-guide-requirement-ids">{section.requirements.join(" · ")}</div>
    <h3>{section.title}</h3><p>{section.summary}</p>
    {section.actions.length > 0 && <details open><summary>点击、去向与返回 <span>{section.actions.length}</span></summary><DefinitionRows rows={section.actions} labels={["入口", "触发", "结果/去向", "返回/取消", "状态保留"]} /></details>}
    {section.fields.length > 0 && <details open><summary>字段与约束 <span>{section.fields.length}</span></summary><DefinitionRows rows={section.fields} labels={["字段", "类型/来源", "必填/展示条件", "格式/约束", "示例", "边界"]} /></details>}
    {section.states.length > 0 && <details open><summary>状态与边界 <span>{section.states.length}</span></summary><DefinitionRows rows={section.states} labels={["状态", "事件/条件", "预期呈现"]} /></details>}
    {section.rules.length > 0 && <details open><summary>联动与业务边界 <span>{section.rules.length}</span></summary><ul>{section.rules.map(rule => <li key={rule}>{rule}</li>)}</ul></details>}
    <details><summary>验收场景与测试输入 <span>{section.cases.length}</span></summary><ol className="prototype-guide-cases">{section.cases.map(test => <li key={test.id}>
      <div><code>{test.id}</code><span className="prototype-guide-stage">{test.stage}</span></div>
      <p><b>前置：</b>{test.given}</p><p><b>操作：</b>{test.when}</p><p><b>预期：</b>{test.then}</p>
    </li>)}</ol></details>
    <details><summary>实现核对位置</summary><ul>{section.sources.map(source => <li key={source}><code>{source}</code></li>)}</ul></details>
  </section>;
}
export default function PrototypeGuide({ scene }: { scene?: GuideScene }) {
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<"current" | "requirements">("current");
  const [query, setQuery] = useState("");
  const [inspection, setInspection] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const tabId = useId();
  const context = spec.contexts.find(item => item.id === scene?.id) ?? spec.contexts[0];
  const currentSections = context.sections.map(id => sectionsById.get(id)).filter((section): section is SpecSection => Boolean(section));
  const currentRequirements = new Set(currentSections.flatMap(section => section.requirements));
  const inspected = inspection ? sectionsById.get(inspection) : undefined;
  const filtered = spec.requirements.filter(req => `${req.id} ${req.area} ${req.title} ${req.basis} ${req.implementation}`.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {
    if (view === "current") content.current?.scrollTo({ top: 0 });
  }, [context.id, view]);
  useEffect(() => {
    if (expanded && window.innerWidth <= 980) root.current?.scrollIntoView({ block: "start", behavior: "instant" });
    if (!expanded && window.innerWidth <= 980) window.scrollTo({ top: 0, behavior: "instant" });
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && event.target instanceof Node && root.current?.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [expanded]);
  useEffect(() => {
    // The phone dialog traps focus. Permit focus only in this external documentation
    // surface without changing the protected dialog or business focus behavior.
    const allowDocumentationFocus = (event: FocusEvent) => {
      const target = event.type === "focusout" ? event.relatedTarget : event.target;
      if (document.querySelector(".bottom-sheet") && target instanceof Node && root.current?.contains(target)) event.stopImmediatePropagation();
    };
    const allowDocumentationScroll = (event: Event) => {
      if (event.target instanceof Node && root.current?.contains(event.target)) event.stopImmediatePropagation();
    };
    document.addEventListener("focusin", allowDocumentationFocus, true);
    document.addEventListener("focusout", allowDocumentationFocus, true);
    window.addEventListener("wheel", allowDocumentationScroll, { capture: true, passive: true });
    window.addEventListener("touchmove", allowDocumentationScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("focusin", allowDocumentationFocus, true);
      document.removeEventListener("focusout", allowDocumentationFocus, true);
      window.removeEventListener("wheel", allowDocumentationScroll, true);
      window.removeEventListener("touchmove", allowDocumentationScroll, true);
    };
  }, []);
  const switchView = (next: typeof view) => { setView(next); setInspection(null); content.current?.scrollTo({ top: 0 }); };
  // This non-live auxiliary region remains readable while the phone's dialog hides siblings.
  // Its events must not dismiss a phone sheet or move focus back into the phone.
  return createPortal(<aside ref={root} className="prototype-guide" data-expanded={expanded} data-guide-context={context.id} aria-label="原型开发与测试说明" aria-live="off"
    onPointerDownCapture={event => event.stopPropagation()} onFocusCapture={event => event.stopPropagation()} onWheelCapture={event => event.stopPropagation()}>
    <button type="button" className="prototype-guide-trigger" aria-expanded={expanded} aria-controls={`${tabId}-body`} onClick={() => setExpanded(value => !value)}>
      <InfoCircledIcon aria-hidden="true" /><span>原型说明</span><small>{expanded ? "收起" : "展开"}</small>{expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </button>
    {expanded && <div id={`${tabId}-body`} className="prototype-guide-body">
      <div className="prototype-guide-context"><span>当前场景</span><h2>{context.title}</h2>
        {scene && <dl>{Object.entries(scene.facts).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      </div>
      <nav className="prototype-guide-links" aria-label="独立说明文档">
        <a href={`${documentUrl}?v=${spec.metadata.revision}#${context.sections[0]}`} target="_blank" rel="noopener noreferrer">完整开发说明<ExternalLinkIcon /></a>
        <a href="/docs/原型开发与测试说明.md" download>下载Markdown</a>
        <a href="/docs/需求列表.md" download>下载需求列表</a>
        <button type="button" className="prototype-guide-return" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>回到原型 ↑</button>
      </nav>
      <div className="prototype-guide-tabs" role="tablist" aria-label="说明内容">
        {(["current", "requirements"] as const).map((key, index) => <button key={key} type="button" role="tab" id={`${tabId}-${key}`} aria-controls={`${tabId}-panel`} aria-selected={view === key} tabIndex={view === key ? 0 : -1} onClick={() => switchView(key)} onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const keys = ["current", "requirements"] as const;
          const next = event.key === "Home" ? 0 : event.key === "End" ? keys.length - 1 : (index + (event.key === "ArrowRight" ? 1 : keys.length - 1)) % keys.length;
          switchView(keys[next]);
          document.getElementById(`${tabId}-${keys[next]}`)?.focus();
        }}>{key === "current" ? "当前页面" : `需求列表 ${spec.requirements.length}`}</button>)}
      </div>
      <div ref={content} className="prototype-guide-content" id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${view}`}>
        {view === "current" && <><p className="prototype-guide-reading-note">说明随页面、Tab、方案和弹窗更新。可演示与待接入能力分别标注；验收场景可展开阅读。</p>{currentSections.map(section => <SectionNotes key={section.id} section={section} />)}<a className="prototype-guide-global" href={`${documentUrl}#scope`} target="_blank" rel="noopener noreferrer">查看通用规则、接口与异常、全部验收场景 ↗</a></>}
        {view === "requirements" && (inspected ? <><button type="button" className="prototype-guide-back" onClick={() => setInspection(null)}>← 返回需求列表</button><SectionNotes section={inspected} /></> : <>
          <label className="prototype-guide-search">查找需求<input type="search" placeholder="编号、模块或需求名称" value={query} onChange={event => setQuery(event.currentTarget.value)} /></label>
          <p className="prototype-guide-reading-note">显示 {filtered.length} / {spec.requirements.length} 项。点击需求阅读关联说明，手机页面保持当前状态。</p>
          <div className="prototype-guide-requirements">{filtered.map(req => <article key={req.id} data-requirement-id={req.id}>
            <div className="prototype-guide-requirement-meta"><code>{req.id}</code><span>{req.area}</span>{currentRequirements.has(req.id) && <em>当前页</em>}</div>
            <h3>{req.title}</h3><p><span>{req.basis}</span><span>{req.implementation}</span></p>
            <div>{spec.sections.filter(section => section.requirements.includes(req.id)).map(section => <button type="button" key={section.id} onClick={() => { setInspection(section.id); content.current?.scrollTo({ top: 0 }); }}>{section.title} →</button>)}</div>
          </article>)}</div>{filtered.length === 0 && <p className="prototype-guide-no-results">没有匹配的需求，请更换关键词。</p>}
        </>)}
      </div>
      <footer className="prototype-guide-footer">原型基线 {spec.metadata.baseVersion} · {spec.metadata.updated} · {spec.metadata.revision}</footer>
    </div>}
  </aside>, document.body);
}
