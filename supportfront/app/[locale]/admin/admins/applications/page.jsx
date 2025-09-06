"use client";
import PermissionWrapper from "@/app/_components/Permission/PermissionWrapper";
import adminApi from "../../../../utils/adminApi";
import { useEffect, useState } from "react";
import { FiCheck, FiX, FiLoader, FiEye } from "react-icons/fi";

// Mapping-lər...
const genderMap = { Male: "Kişi", Female: "Qadın", Other: "Digər" };
const educationMap = {
  Secondary: "Orta",
  "Vocational secondary": "Orta ixtisas",
  Bachelor: "Bakalavr",
  "Master+": "Magistr və yuxarı",
};
const weeklyHoursMap = {
  "1–5": "1–5 saat",
  "6–10": "6–10 saat",
  "11+": "11+ saat",
};
const daysMap = {
  Monday: "Bazar ertəsi",
  Wednesday: "Çərşənbə",
  Thursday: "Cümə axşamı",
  Weekend: "Həftəsonu",
};
const statusMap = {
  pending: "Gözləyir",
  approved: "Qəbul olunub",
  rejected: "İmtina edilib",
};
const volunteerAreasMap = {
  Awareness: "Maarifləndirmə",
  Shelter: "Sığınacaq",
  "Child-focused": "Uşaq yönümlü",
  "Social media & content": "Sosial media və kontent",
  Translation: "Tərcümə",
  Research: "Tədqiqat",
  Legal: "Hüquqi dəstək",
  Psychological: "Psixoloji dəstək",
};

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [refresh, setRefresh] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminApi.get(`/volunteer`, {
          params: { status: statusFilter, search, page, limit: 10 },
        });
        setVolunteers(res.data.data || []);
        setTotalPages(res.data.meta?.totalPages || 1);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [statusFilter, refresh, search, page]);

  const handleApprove = async (id) => {
    if (!confirm("Bu müraciəti qəbul etmək istədiyinizə əminsiniz?")) return;
    await adminApi.patch(`/volunteer/${id}/approve`);
    setRefresh(!refresh);
  };

  const handleReject = async (id) => {
    if (!confirm("Bu müraciəti rədd etmək istədiyinizə əminsiniz?")) return;
    await adminApi.patch(`/volunteer/${id}/reject`);
    setRefresh(!refresh);
  };

  return (
    <PermissionWrapper permission={"application_editor"}>
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Könüllü Müraciətləri</h1>

        {/* Filter + Search */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {["pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === s ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              {statusMap[s]}
            </button>
          ))}
          <input
            type="text"
            placeholder="Axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <FiLoader className="animate-spin text-3xl text-gray-500" />
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3">Ad Soyad</th>
                  <th className="p-3 hidden md:table-cell">Email</th>
                  <th className="p-3 hidden lg:table-cell">Telefon</th>
                  <th className="p-3">Təhsil</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{v.fullName}</td>
                    <td className="p-3 hidden md:table-cell">{v.email}</td>
                    <td className="p-3 hidden lg:table-cell">{v.phone}</td>
                    <td className="p-3">
                      {educationMap[v.educationLevel] || v.educationLevel}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          v.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : v.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {statusMap[v.status] || v.status}
                      </span>
                    </td>
                    <td className="p-3 flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedVolunteer(v)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      >
                        <FiEye />
                      </button>
                      {v.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(v._id)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleReject(v._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {volunteers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Heç bir müraciət tapılmadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  page === p ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedVolunteer && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={() => setSelectedVolunteer(null)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Müraciət Detalları</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Ad Soyad:</strong> {selectedVolunteer.fullName}
                </p>
                <p>
                  <strong>Doğum tarixi:</strong> {selectedVolunteer.birthDate}
                </p>
                <p>
                  <strong>Cins:</strong>{" "}
                  {genderMap[selectedVolunteer.gender] ||
                    selectedVolunteer.gender}
                </p>
                <p>
                  <strong>Telefon:</strong> {selectedVolunteer.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedVolunteer.email}
                </p>
                <p>
                  <strong>Ünvan:</strong> {selectedVolunteer.address}
                </p>
                <p>
                  <strong>Təhsil səviyyəsi:</strong>{" "}
                  {educationMap[selectedVolunteer.educationLevel] ||
                    selectedVolunteer.educationLevel}
                </p>
                <p>
                  <strong>Bitirdiyi müəssisə:</strong>{" "}
                  {selectedVolunteer.graduatedSchool}
                </p>
                <p>
                  <strong>İxtisas:</strong> {selectedVolunteer.profession}
                </p>
                <p>
                  <strong>İş yeri:</strong> {selectedVolunteer.workplace}
                </p>
                <p>
                  <strong>Vəzifə:</strong> {selectedVolunteer.position}
                </p>
                <p>
                  <strong>Könüllü sahələr:</strong>{" "}
                  {selectedVolunteer.volunteerAreas
                    ?.map((a) => volunteerAreasMap[a] || a)
                    .join(", ")}
                </p>
                {selectedVolunteer.otherArea && (
                  <p>
                    <strong>Digər sahə:</strong> {selectedVolunteer.otherArea}
                  </p>
                )}
                {selectedVolunteer.previousExperience && (
                  <p>
                    <strong>Əvvəlki təcrübə:</strong>{" "}
                    {selectedVolunteer.previousExperience}
                  </p>
                )}
                {selectedVolunteer.motivation && (
                  <p>
                    <strong>Motivasiya:</strong> {selectedVolunteer.motivation}
                  </p>
                )}
                <p>
                  <strong>Həftəlik saat:</strong>{" "}
                  {weeklyHoursMap[selectedVolunteer.weeklyHours] ||
                    selectedVolunteer.weeklyHours}
                </p>
                <p>
                  <strong>Mövcud günlər:</strong>{" "}
                  {selectedVolunteer.availableDays
                    ?.map((d) => daysMap[d] || d)
                    .join(", ")}
                </p>
                <p>
                  <strong>Mövcud saat aralığı:</strong>{" "}
                  {selectedVolunteer.availableTimeRange}
                </p>
                {selectedVolunteer.skills && (
                  <p>
                    <strong>Bacarıqlar:</strong> {selectedVolunteer.skills}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>{" "}
                  {statusMap[selectedVolunteer.status] ||
                    selectedVolunteer.status}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionWrapper>
  );
}
