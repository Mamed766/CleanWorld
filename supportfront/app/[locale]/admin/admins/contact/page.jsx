"use client";

import adminApi from "@/app/utils/adminApi";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
// Basit socket hook (sayfa içinde)
// function useNotifications(onReceive) {
//   useEffect(() => {
//     const url = process.env.NEXT_PUBLIC_SOCKET_URL || "";
//     if (!url) return;
//     const socket = io(url, { transports: ["websocket"] });
//     const handler = (payload) => onReceive && onReceive(payload);
//     socket.on("receiveNotification", handler);
//     return () => {
//       socket.off("receiveNotification", handler);
//       socket.close();
//     };
//   }, [onReceive]);
// }

export default function AdminContactPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [q, setQ] = useState("");
  const [read, setRead] = useState("");
  const [replied, setReplied] = useState("");

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(null);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [msg, setMsg] = useState(null);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const load = async (opts = {}) => {
    setLoading(true);
    try {
      const params = { q, page: opts.keepPage ? page : 1, limit };
      if (read !== "") params.read = read;
      if (replied !== "") params.replied = replied;
      const res = await adminApi.get("/contact/admin", { params }); // ✅
      setItems(res?.data?.items || []);
      setTotal(res?.data?.total || 0);
      if (!opts.keepPage) setPage(1);
    } catch (e) {
      setMsg({
        type: "err",
        text: e?.response?.data?.message || "Load failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [read, replied]);

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const go = async (p) => {
    if (p < 1 || p > pages) return;
    setLoading(true);
    try {
      const params = { q, page: p, limit };
      if (read !== "") params.read = read;
      if (replied !== "") params.replied = replied;
      const res = await adminApi.get("/contact/admin", { params }); // ✅
      setItems(res?.data?.items || []);
      setTotal(res?.data?.total || 0);
      setPage(p);
    } catch (e) {
      setMsg({
        type: "err",
        text: e?.response?.data?.message || "Load failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await adminApi.patch(`/contact/admin/${id}/read`); // ✅
      setMsg({ type: "ok", text: "Marked as read." });
      await load({ keepPage: true });
      if (view?._id === id) setView((v) => (v ? { ...v, read: true } : v));
    } catch (e) {
      setMsg({
        type: "err",
        text: e?.response?.data?.message || "Failed to mark as read.",
      });
    }
  };

  const sendReply = async () => {
    if (!view?._id) return;
    if (!replyText.trim()) {
      setMsg({ type: "err", text: "Reply text required." });
      return;
    }
    setReplying(true);
    try {
      await adminApi.post(`/contact/admin/${view._id}/reply`, { replyText }); // ✅
      setMsg({ type: "ok", text: "Reply sent." });
      setReplyText("");
      await load({ keepPage: true });
      setView((v) => (v ? { ...v, replied: true, replyText } : v));
    } catch (e) {
      console.error("reply error:", e?.response?.data || e.message); // debug için
      setMsg({
        type: "err",
        text: e?.response?.data?.message || "Failed to reply.",
      });
    } finally {
      setReplying(false);
    }
  };
  //   useNotifications((n) => {
  //     if (n?.type !== "contact") return;
  //     load({ keepPage: true });
  //   });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Əlaqə Mesajları</h1>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Axtar ad/email/mövzu/mesaj..."
          className="border rounded-lg px-3 py-2 w-64"
        />
        <select
          value={read}
          onChange={(e) => setRead(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Hamısı</option>
          <option value="false">Oxunmamışlar</option>
          <option value="true">Oxunmuşlar</option>
        </select>
        <select
          value={replied}
          onChange={(e) => setReplied(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Hamısı</option>
          <option value="false">Cavab verilməyənlər</option>
          <option value="true">Cavab verilənlər</option>
        </select>
        <button onClick={() => load()} className="px-4 py-2 rounded-lg border">
          Yenilə
        </button>
        {loading && <span className="text-sm text-gray-600">Loading…</span>}
        {msg && (
          <span
            className={
              "text-sm px-2 py-1 rounded " +
              (msg.type === "ok"
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200")
            }
          >
            {msg.text}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items.map((m) => (
          <div
            key={m._id}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow transition"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div className="min-w-[200px]">
                <div className="font-semibold">
                  {m.fullName} &lt;{m.email}&gt;
                </div>
                <div className="text-sm text-gray-600">{m.phone || "-"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    "px-2 py-0.5 rounded text-xs border " +
                    (m.read
                      ? "text-gray-700 bg-gray-50 border-gray-300"
                      : "text-blue-700 bg-blue-50 border-blue-300")
                  }
                >
                  {m.read ? "Oxundu" : "Oxunmadı"}
                </span>
                <span
                  className={
                    "px-2 py-0.5 rounded text-xs border " +
                    (m.replied
                      ? "text-green-700 bg-green-50 border-green-300"
                      : "text-amber-700 bg-amber-50 border-amber-300")
                  }
                >
                  {m.replied ? "Cavab verildi" : "Gözləyir"}
                </span>
              </div>
            </div>

            <div className="mt-2 font-medium">{m.subject}</div>
            <div className="text-sm line-clamp-2 text-gray-700">
              {m.message}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {!m.read && (
                <button
                  onClick={() => markRead(m._id)}
                  className="px-3 py-1.5 rounded border"
                >
                  Oxundu işarətlə
                </button>
              )}
              <button
                onClick={() => setView(m)}
                className="px-3 py-1.5 rounded bg-black text-white"
              >
                Bax / Cavab ver
              </button>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {!items.length && !loading && (
          <p className="text-sm text-gray-600">No messages found.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded border"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} / {pages}
          </span>
          <button
            className="px-3 py-1.5 rounded border"
            onClick={() => go(page + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setView(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xl font-semibold">{view.subject}</div>
                <div className="text-sm text-gray-600">
                  {view.fullName} &lt;{view.email}&gt; •{" "}
                  {new Date(view.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                className="px-3 py-1.5 rounded border"
                onClick={() => setView(null)}
              >
                Close
              </button>
            </div>

            {!view.read && (
              <button
                onClick={() => markRead(view._id)}
                className="mt-3 px-3 py-1.5 rounded border"
              >
                Oxundu işarətlə
              </button>
            )}

            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-1">Mesaj</div>
              <div className="whitespace-pre-wrap border rounded-lg p-3">
                {view.message}
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Cavab</div>
                {view.replied && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                    Replied{" "}
                    {view.repliedAt
                      ? "• " + new Date(view.repliedAt).toLocaleString()
                      : ""}
                  </span>
                )}
              </div>

              <textarea
                className="mt-2 w-full min-h-[140px] border rounded-lg p-3"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to the user..."
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={sendReply}
                  disabled={replying}
                  className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
                >
                  {replying ? "Göndərili" : "Göndər"}
                </button>
                <button
                  onClick={() => setReplyText("")}
                  className="px-4 py-2 rounded border"
                >
                  Təmizlə
                </button>
              </div>

              {view.replyText && !replyText && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-1">Last reply</div>
                  <div className="whitespace-pre-wrap border rounded-lg p-3 bg-gray-50">
                    {view.replyText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
