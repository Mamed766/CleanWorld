"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  X,
  ExternalLink,
  Search,
  Tag as TagIcon,
  Copy,
} from "lucide-react";
import { useTranslations } from "next-intl";

/** ---------- DATA ---------- */
// Windows ekran görüntüsündeki PDF isimleri
const FILENAMES = [
  "Akkreditasiya.pdf",
  "CIZM Siyasəti-TƏMİZ DÜNYA.pdf",
  "Davranış kodeksi-TƏMİZ DÜNYA.pdf",
  "Edliyye sahadatname.pdf",
  "Erkən-nikah- SON.pdf",
  "hesabat 2010.pdf",
  "HESABAT YEKUN 2020.pdf",
  "HESABAT YEKUN 2022.pdf",
  "Hesabat2006.pdf",
  "Hesabat2007.pdf",
  "Hesabat2008.pdf",
  "Hesabat2009.pdf",
  "Insan alveri haqda 2009-az.pdf",
  "KİV-İN MONİTORİNQİ 2023.pdf",
  "Mehriban Zeynalova tədqiqat kişilər.pdf",
  "MZ dair Siyasət.pdf",
  "Nizamname 2022.pdf",
  "Qezetlerin siyahisi.pdf",
  "TƏDQİQAT 2.pdf",
  "TƏŞKİLATIN 2016 CI İL ÜZRƏ.pdf",
  "Təşkilatin 2022 hesabat.pdf",
];

// Daha soft / light aksanlar
const ACCENTS = [
  "from-emerald-400/20 via-teal-400/15 to-sky-400/20",
  "from-fuchsia-400/20 via-purple-400/15 to-blue-400/20",
  "from-teal-400/20 via-emerald-400/15 to-cyan-400/20",
  "from-indigo-400/20 via-sky-400/15 to-cyan-400/20",
];

// Light glass kart stili
const glass = "bg-white border border-slate-200 shadow-sm";

/** ---------- HELPERS ---------- */
const enc = (s) => encodeURIComponent(s);
const titleOf = (name) => name.replace(/\.pdf$/i, "");
const publicPathOf = (name) => `/files/${enc(name)}`;
const hash = (s) =>
  s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
const accentOf = (s) => ACCENTS[Math.abs(hash(s)) % ACCENTS.length];

// Kateqoriya çıxarma (AZ titul üzərindən)
const inferCategory = (t) => {
  const s = t.toLowerCase();
  if (s.includes("yekun") || s.includes("hesabat")) return "Hesabatlar";
  if (s.includes("tədqiqat")) return "Tədqiqat";
  if (s.includes("nizamname")) return "Nizamnamə";
  if (s.includes("monitorinq")) return "Monitorinq";
  if (s.includes("siyasət") || s.includes("siyaset")) return "Siyasət";
  if (s.includes("akkreditasiya")) return "Akkreditasiya";
  return "Digər";
};

// AZ kateqoriya -> çeviri label (UI'da gösterim)
const labelOfCategory = (az, t) => {
  const map = {
    Hesabatlar: t("cat.reports"),
    Tədqiqat: t("cat.research"),
    Nizamnamə: t("cat.charter"),
    Monitorinq: t("cat.monitoring"),
    Siyasət: t("cat.policy"),
    Akkreditasiya: t("cat.accreditation"),
    Digər: t("cat.other"),
  };
  return map[az] || az;
};

const ALL_KEY = "Hamısı"; // iç mantık AZ kalsın, UI çevirisi t("filterAll")

/** ---------- RESPONSIVE HOOK ---------- */
// 1024px altını (lg'den küçük) mobile+tablet say
function useSmallScreen(max = 1023) {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${max}px)`);
    const onChange = (e) => setIsSmall(e.matches);
    setIsSmall(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [max]);
  return isSmall;
}

/** ---------- REUSABLE UI ---------- */
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition ${
        active
          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ t, query, setQuery, categories, activeCat, setActiveCat }) {
  return (
    <div className="mt-[5rem]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* search */}
        <div
          className={`${glass} w-full md:w-96 rounded-2xl px-4 py-2.5 flex items-center gap-2`}
        >
          <Search size={18} className="text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="bg-transparent outline-none text-slate-800 placeholder:text-slate-400 w-full"
          />
        </div>
        {/* tags */}
        <div className="flex flex-wrap gap-2">
          <Chip
            active={activeCat === ALL_KEY}
            onClick={() => setActiveCat(ALL_KEY)}
          >
            <span className="inline-flex items-center gap-1">
              <TagIcon size={14} /> {t("filterAll")}
            </span>
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c}
              active={activeCat === c}
              onClick={() => setActiveCat(c)}
            >
              {labelOfCategory(c, t)}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function PdfCard({ item, onOpen }) {
  const accent = accentOf(item.title);
  return (
    <motion.button
      onClick={() => onOpen(item)}
      variants={{ hidden: { y: 18, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      className={`group text-left ${glass} rounded-3xl p-4 relative overflow-hidden`}
      style={{ boxShadow: "0 10px 25px rgba(2, 6, 23, .06)" }}
    >
      {/* soft glow bg */}
      <div
        className={`pointer-events-none absolute -inset-1 opacity-30 blur-2xl bg-gradient-to-br ${accent}`}
      />
      <div className="relative z-10 flex items-start gap-3">
        <div className="rounded-2xl p-3 bg-emerald-50 border border-emerald-100">
          <FileText className="text-emerald-700" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
            {item.title}
          </h3>
          <div className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>PDF</span>
          </div>
        </div>
      </div>
      {/* hover ring */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200 group-hover:ring-emerald-300/60 transition" />
    </motion.button>
  );
}

function PdfModal({ item, onClose, t }) {
  if (!item) return null;
  const url = publicPathOf(item.name);
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/30"
        onClick={onClose}
      />
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 20, stiffness: 220 }}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
      >
        <div
          className={`w-full max-w-6xl h-[85vh] ${glass} rounded-3xl overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
          style={{ boxShadow: "0 20px 60px rgba(2, 6, 23, .12)" }}
        >
          {/* header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 bg-slate-50/60">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600">
                {labelOfCategory(item.category, t)} • {item.size || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={url}
                download
                className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200/60 transition inline-flex items-center gap-2"
              >
                <Download size={16} /> {t("btnDownload")}
              </a>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition inline-flex items-center gap-2"
              >
                <ExternalLink size={16} /> {t("btnNewTab")}
              </a>
              <button
                onClick={() => navigator.clipboard?.writeText(url)}
                className="px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition inline-flex items-center gap-2"
              >
                <Copy size={16} /> {t("btnCopyLink")}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {/* body */}
          <div className="p-2 grow bg-white">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <embed
                src={`${url}#toolbar=1&navpanes=0&view=FitH`}
                type="application/pdf"
                className="w-full h-full rounded-xl"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/** ---------- PAGE ---------- */
export default function DocumentsPage() {
  const t = useTranslations("documents");

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(ALL_KEY);
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);

  const isSmallScreen = useSmallScreen(); // <— mobile+tablet kontrolü

  useEffect(() => {
    const tmo = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(tmo);
  }, []);

  const items = useMemo(() => {
    return FILENAMES.map((name) => {
      const title = titleOf(name);
      const category = inferCategory(title);
      return { name, title, category, date: "", size: "" };
    });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const okCat = activeCat === ALL_KEY || i.category === activeCat;
      const okQ =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [items, query, activeCat]);

  // Kart tıklama davranışı: mobile/tablet yeni sekme, desktop modal
  const handleOpen = (item) => {
    const url = publicPathOf(item.name);
    if (isSmallScreen) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setSelected(item);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative overflow-hidden bg-white text-slate-900"
    >
      {/* Light arxa plan: yumşaq yaşıl vurğular */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-32 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,.12),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 -right-28 w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,.10),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,.05)_0%,rgba(255,255,255,0)_35%,rgba(59,130,246,.05)_70%,rgba(255,255,255,0)_100%)]" />
      </div>

      {/* content */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 sm:mt+[8rem] lg:mt-[10rem]">
        <div className="mb-6">
          <Toolbar
            t={t}
            query={query}
            setQuery={setQuery}
            categories={categories}
            activeCat={activeCat}
            setActiveCat={setActiveCat}
          />
        </div>

        {/* grid */}
        <motion.div
          variants={{
            show: {
              transition: { staggerChildren: 0.045, delayChildren: 0.08 },
            },
          }}
          initial="hidden"
          animate={mounted ? "show" : "hidden"}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence initial={false}>
            {filtered.map((item) => (
              <PdfCard key={item.name} item={item} onOpen={handleOpen} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* empty state */}
        {filtered.length === 0 && (
          <div className="mt-20 text-center text-slate-500">{t("empty")}</div>
        )}
      </section>

      {/* modal (sadece desktop’ta seçilince görünür) */}
      <PdfModal item={selected} onClose={() => setSelected(null)} t={t} />
    </motion.main>
  );
}
