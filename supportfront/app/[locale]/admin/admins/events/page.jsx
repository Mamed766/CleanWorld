"use client";

import { useEffect, useState, useCallback } from "react";
import { FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import PermissionWrapper from "@/app/_components/Permission/PermissionWrapper";
import adminApi from "../../../../utils/adminApi";
import Modal from "../../../../_components/Modal/Modal";
import { truncateText } from "../../utils/utils";

// blog patternine sadık özel modallar
import EventsEditModal from "./EventsEditModal";
import EventsCreateModal from "./EventsCreateModal";

const DEFAULT_LIMIT = 10;

const EventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [loading, setLoading] = useState(false);

  // Blog’daki gibi: sadece q + page/limit
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (q && q.trim()) params.q = q.trim();

      // backend: app.use("/api/v3/admin/events", eventRoutes);
      const res = await adminApi.get("/admin/events", { params });

      // Blog’daki gibi iki formatı da destekle
      const list = res?.data?.events || [];
      const pagination = res?.data?.pagination;

      setEvents(list);

      if (pagination) {
        setTotal(pagination.total || 0);
        setTotalPages(pagination.totalPages || 1);
      } else {
        setTotal(list.length);
        setTotalPages(1);
        if (page !== 1) setPage(1);
      }
    } catch {
      console.log("Eventlər yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id) => {
    if (!confirm("Bu event-i silmək istədiyinizə əminsiniz?")) return;
    try {
      await adminApi.delete(`/admin/events/${id}`);
      toast.success("Event silindi");

      if (events.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchEvents();
      }
    } catch {
      toast.error("Silinmə zamanı xəta baş verdi");
    }
  };

  // Blog patterni: Modal, FormData döndürür -> direkt gönder
  const handleUpdate = async (updatedData) => {
    try {
      const res = await adminApi.put(
        `/admin/events/${selectedEvent._id}`,
        updatedData
      );
      const updated = res.data.updatedEvent;

      setEvents((prev) =>
        prev.map((e) => (e._id === updated._id ? updated : e))
      );
      toast.success("Event yeniləndi");
      setShowEditModal(false);
      setSelectedEvent(null);
    } catch {
      toast.error("Yenilənmə zamanı xəta baş verdi");
    }
  };

  const handleCreate = async (data) => {
    try {
      await adminApi.post("/admin/events", data);
      toast.success("Event yaradıldı");
      setShowCreateModal(false);
      setPage(1);
      fetchEvents();
    } catch {
      toast.error("Yaratma zamanı xəta baş verdi");
    }
  };

  const handleView = (ev) => {
    setSelectedEvent(ev);
    setShowViewModal(true);
  };

  const handleEdit = (ev) => {
    setSelectedEvent(ev);
    setShowEditModal(true);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const clearSearch = () => {
    if (!q) return;
    setQ("");
    setPage(1);
  };

  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const goNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const formatDT = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <PermissionWrapper permission="event_editor">
      <div className="p-6 mt-[6rem] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Events Admin Paneli
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Yeni Event
          </button>
        </div>

        {/* Search + Pagination Controls (blog ile aynı) */}
        <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center">
          <form
            onSubmit={onSearchSubmit}
            className="flex gap-2 items-center w-full md:w-auto"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Axtar: başlıq və ya təsvir..."
              className="w-full md:w-80 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Axtar
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Təmizlə
            </button>
          </form>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Səhifə ölçüsü:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="border rounded-lg px-2 py-2"
            >
              {[5, 10, 15, 20, 30].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Cəmi: <b>{total}</b>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={page <= 1 || loading}
                className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
              >
                Öncekı
              </button>
              <span className="text-sm text-gray-700">
                Səhifə <b>{page}</b> / {totalPages}
              </span>
              <button
                onClick={goNext}
                disabled={page >= totalPages || loading}
                className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
              >
                Sonrakı
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FiLoader className="animate-spin text-4xl text-gray-500" />
          </div>
        ) : (
          <div className="rounded-lg shadow bg-white overflow-hidden">
            {/* Header - blog ile benzer, event sütunlarıyla */}
            <div className="hidden md:grid md:grid-cols-8 font-semibold bg-gray-100 p-3 text-gray-700">
              <div>Şəkil</div>
              <div>Title AZ</div>
              <div>Başlama</div>
              <div>Bitmə</div>
              <div>Məkan</div>
              <div>Status</div>
              <div className="col-span-2 text-center">Əməliyyatlar</div>
            </div>

            {events && events.length > 0 ? (
              events.map((ev, idx) => (
                <div
                  key={ev._id}
                  className={`border-b md:grid md:grid-cols-8 items-center p-3 transition ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 flex flex-col md:flex-none gap-3`}
                >
                  {/* Şəkil */}
                  <div>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/${ev.image}`}
                      alt="event"
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Title */}
                  <div className="truncate">{truncateText(ev.titleAZ, 20)}</div>

                  {/* Dates */}
                  <div className="text-sm">{formatDT(ev.startDate)}</div>
                  <div className="text-sm">{formatDT(ev.endDate)}</div>

                  {/* Location */}
                  <div className="truncate">
                    {truncateText(ev.location || "-", 20)}
                  </div>

                  {/* Status */}
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold w-fit ${
                      ev.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {ev.status}
                  </div>

                  {/* Buttons */}
                  <div className="md:col-span-2 flex gap-2 flex-wrap justify-start md:justify-center">
                    <button
                      onClick={() => handleView(ev)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Bax
                    </button>
                    <button
                      onClick={() => handleEdit(ev)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Redaktə et
                    </button>
                    <button
                      onClick={() => handleDelete(ev._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Heç bir event tapılmadı.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bax Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
        {selectedEvent && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 break-words">
              {selectedEvent.titleAZ} / {selectedEvent.titleEN}
            </h2>

            <img
              src={`${process.env.NEXT_PUBLIC_API}/${selectedEvent.image}`}
              alt="event"
              className="w-full max-h-[350px] object-cover rounded-lg shadow"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <b>Başlama:</b> {formatDT(selectedEvent.startDate)}
              </div>
              <div>
                <b>Bitmə:</b> {formatDT(selectedEvent.endDate)}
              </div>
              <div>
                <b>Məkan:</b> {selectedEvent.location || "-"}
              </div>
              <div>
                <b>Status:</b> {selectedEvent.status}
              </div>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed space-y-3 break-words">
              <p className="whitespace-pre-line break-words">
                {selectedEvent.descriptionAZ}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal (blog patterni: isOpen/onClose/blog/onSubmit) */}
      <EventsEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={selectedEvent}
        onSubmit={handleUpdate}
      />

      {/* Create Modal (blog patterni: isOpen/onClose/onSubmit) */}
      <EventsCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
    </PermissionWrapper>
  );
};

export default EventsAdmin;
