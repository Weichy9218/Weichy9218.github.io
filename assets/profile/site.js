const themeButton = document.querySelector(".theme-button");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let preferredTheme;
try {
  preferredTheme = localStorage.getItem("cw-theme");
} catch {
  /* Theme remains available without storage. */
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeButton) {
    const dark = theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute(
      "aria-label",
      dark ? "Use light theme" : "Use dark theme",
    );
  }
}
applyTheme(
  preferredTheme === "dark" || preferredTheme === "light"
    ? preferredTheme
    : systemTheme.matches
      ? "dark"
      : "light",
);
if (themeButton) {
  themeButton.hidden = false;
  themeButton.addEventListener("click", () => {
    preferredTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(preferredTheme);
    try {
      localStorage.setItem("cw-theme", preferredTheme);
    } catch {
      /* A session-only preference is sufficient. */
    }
  });
}
systemTheme.addEventListener("change", (event) => {
  if (!preferredTheme) applyTheme(event.matches ? "dark" : "light");
});

/* CV print button */
const printCvBtn = document.querySelector("[data-print-cv]");
if (printCvBtn) {
  printCvBtn.hidden = false;
  printCvBtn.addEventListener("click", () => window.print());
}

/* Note enhancements: automatic TOC, prev/next pager + back-to-top, native image lightbox */
const noteArticle = document.querySelector(".note-article");
if (noteArticle) {
  const noteHeader = noteArticle.querySelector(".note-header");
  const sections = Array.from(noteArticle.querySelectorAll("section[id]")).filter(
    (sec) => sec.id !== "references" && sec.querySelector(":scope > h2"),
  );

  if (noteHeader && sections.length >= 2 && !noteArticle.querySelector(".note-toc")) {
    const toc = document.createElement("details");
    toc.className = "note-toc";
    if (window.innerWidth >= 768 && (noteArticle.textContent || "").length > 4200) {
      toc.open = true;
    }
    const summary = document.createElement("summary");
    summary.textContent = `目录（${sections.length} 节）`;
    toc.appendChild(summary);

    const list = document.createElement("ol");
    for (const sec of sections) {
      const h2 = sec.querySelector(":scope > h2");
      if (!h2) continue;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${sec.id}`;
      a.textContent = h2.textContent.trim();
      li.appendChild(a);
      list.appendChild(li);
    }
    toc.appendChild(list);
    noteHeader.insertAdjacentElement("afterend", toc);
  }

  /* Ordered local note list (reverse chronological) for prev/next navigation */
  const NOTES_ORDER = [
    { slug: "liquid-ai-tianshu-interview", title: "验证速度决定迭代上限" },
    { slug: "muon-optimizer", title: "Muon 为什么前期快、后期震荡" },
    { slug: "acc-long-context-training", title: "为什么多轮 Agent SFT 学不好长上下文" },
    { slug: "on-policy-distillation", title: "OPD 为什么比 RL 省算力，以及何时失效" },
    { slug: "retrieval-bm25", title: "BM25 的概率由来：为什么词频必须饱和" },
    { slug: "mirothinker-training", title: "用交互深度换参数量：MiroThinker 三阶段后训练拆解" },
    { slug: "context-attribution", title: "长推理链归因为何断裂：从扰动法到 CAGE 因果图" },
    { slug: "time-series-survey", title: "时间序列建模演进：从统计分解、大模型到模型空间" },
    { slug: "diffusion-rl", title: "扩散模型与强化学习：把轨迹规划写成条件采样" },
    { slug: "mcp", title: "MCP 统一了工具接口，但把上下文账单转给了 Agent" },
    { slug: "gpt-2-reading", title: "重读 GPT-2：多任务能力如何从语言建模里长出来" },
  ];

  const pathMatch = window.location.pathname.match(/\/notes\/([^/]+)\/?/);
  const currentSlug = pathMatch ? pathMatch[1] : null;
  const idx = currentSlug
    ? NOTES_ORDER.findIndex((item) => item.slug === currentSlug)
    : -1;

  const pager = document.createElement("nav");
  pager.className = "note-pager";
  pager.setAttribute("aria-label", "Note navigation");

  const newer = idx > 0 ? NOTES_ORDER[idx - 1] : null;
  const older = idx >= 0 && idx < NOTES_ORDER.length - 1 ? NOTES_ORDER[idx + 1] : null;

  const prevSlot = document.createElement("div");
  prevSlot.className = "note-pager-slot";
  if (newer) {
    const a = document.createElement("a");
    a.href = `../${newer.slug}/`;
    a.innerHTML = `<span class="note-pager-label">较新一篇</span><span class="note-pager-title">← ${newer.title}</span>`;
    prevSlot.appendChild(a);
  }
  pager.appendChild(prevSlot);

  const topSlot = document.createElement("div");
  topSlot.className = "note-pager-top";
  const topBtn = document.createElement("a");
  topBtn.href = "#main";
  topBtn.textContent = "↑ 回到顶部";
  topSlot.appendChild(topBtn);
  pager.appendChild(topSlot);

  const nextSlot = document.createElement("div");
  nextSlot.className = "note-pager-slot note-pager-next";
  if (older) {
    const a = document.createElement("a");
    a.href = `../${older.slug}/`;
    a.innerHTML = `<span class="note-pager-label">较早一篇</span><span class="note-pager-title">${older.title} →</span>`;
    nextSlot.appendChild(a);
  }
  pager.appendChild(nextSlot);

  noteArticle.appendChild(pager);

  /* Native <dialog> Lightbox for academic figures */
  const figureImgs = Array.from(noteArticle.querySelectorAll(".note-img-figure img"));
  if (figureImgs.length > 0 && typeof HTMLDialogElement !== "undefined") {
    const dialog = document.createElement("dialog");
    dialog.className = "img-lightbox";
    dialog.setAttribute("aria-label", "图片放大预览");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "img-lightbox-close";
    closeBtn.setAttribute("aria-label", "关闭预览");
    closeBtn.textContent = "×";

    const fullImg = document.createElement("img");
    fullImg.alt = "";

    const caption = document.createElement("p");
    caption.className = "img-lightbox-caption";

    dialog.appendChild(closeBtn);
    dialog.appendChild(fullImg);
    dialog.appendChild(caption);
    document.body.appendChild(dialog);

    const openLightbox = (img) => {
      fullImg.src = img.currentSrc || img.src;
      fullImg.alt = img.alt || "";
      const fig = img.closest("figure");
      const capEl = fig ? fig.querySelector("figcaption") : null;
      caption.textContent = capEl ? capEl.textContent.trim() : img.alt || "";
      caption.hidden = !caption.textContent;
      dialog.showModal();
    };

    closeBtn.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    for (const img of figureImgs) {
      img.tabIndex = 0;
      img.title = "点击放大查看";
      img.addEventListener("click", () => openLightbox(img));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(img);
        }
      });
    }
  }
}
