const { Admin } = require("../models/admin");
const bcrypt = require("bcrypt");
const allPermissions = require("../config/permissions");

const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, roleId } = req.body;

    const admin = new Admin({
      firstName,
      lastName,
      username,
      email,
      password,
      role: roleId || null,
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: "Error creating admin: " + err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request:", email, password);

    const admin = await Admin.findOne({ email }).populate("role");
    console.log("Found admin:", admin);

    if (!admin) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(password, admin.password);
    console.log("Password match:", validPassword);

    if (!validPassword)
      return res.status(400).send("Invalid email or password");

    // Eğer super_admin ise runtime permissions ekle
    if (admin.role?.name === "super_admin") {
      if (admin.role.permissions.length !== allPermissions.length) {
        admin.role.permissions = allPermissions;
        await admin.role.save();
        console.log("Super admin permissions updated in DB");
      }
    }

    const token = admin.generateAuthToken(admin.role); // role bilgilerini token'a ekle

    res.status(200).send({ token, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error logging in: " + err.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store"); // 304-ün qarşısını alır  // changed

    const { search = "", page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ],
    };

    const admins = await Admin.find(query)
      .populate("role")
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const filteredAdmins = admins.filter(
      (admin) => admin.role?.name !== "super_admin"
    );

    const total = await Admin.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ data: filteredAdmins, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Error fetching admins: " + err.message });
  }
};

// Tek admini görüntüleme
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select("-password")
      .populate("role");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: "Error fetching admin: " + err.message });
  }
};

// Admin güncelleme (isim, email, username)
const updateAdminById = async (req, res) => {
  try {
    const { firstName, lastName, email, username } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.email = email || admin.email;
    admin.username = username || admin.username;

    // --- ROLE: roleId | role._id | role | role name dəstəyi  // changed
    const roleAny =
      (req.body && (req.body.roleId ?? req.body.role)) ?? undefined;
    const isObjId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

    if (roleAny !== undefined) {
      let newRoleId = null;

      if (typeof roleAny === "object" && roleAny) {
        if (roleAny._id && isObjId(roleAny._id)) newRoleId = roleAny._id;
        else if (roleAny.id && isObjId(roleAny.id)) newRoleId = roleAny.id;
        else if (typeof roleAny.name === "string" && roleAny.name.trim()) {
          // rol adından həll etmək (dinamik require; path uyğunsuz olsa sayt pozulmasın deyə try/catch)
          try {
            const Role = require("../models/role");
            const found = await Role.findOne({
              name: roleAny.name.trim(),
            }).select("_id");
            if (found) newRoleId = found._id;
          } catch (_) {
            /* optional: role modeli yoxdursa, sükutla keç */
          }
        }
      } else if (typeof roleAny === "string") {
        if (isObjId(roleAny)) {
          newRoleId = roleAny;
        } else {
          try {
            const Role = require("../models/role");
            const found = await Role.findOne({ name: roleAny.trim() }).select(
              "_id"
            );
            if (found) newRoleId = found._id;
          } catch (_) {
            /* ignore */
          }
        }
      }

      // null yazmaq rolu silmək deməkdir (seçimdən asılı)  // changed
      admin.role = newRoleId;
    }

    await admin.save();
    await admin.populate("role"); // UI dərhal yeni rolu görsün  // changed

    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (err) {
    console.error("updateAdminById error:", err);
    res.status(500).json({ message: "Error updating admin: " + err.message });
  }
};

// Admin silme
const deleteAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("role");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.role?.name === "super_admin") {
      return res.status(403).json({ message: "Super admin silinemez!" });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting admin: " + err.message });
  }
};

const updateAdminRole = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { roleId } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // --- normalize roleId ("" | null | "null" -> null) // changed
    const normalizedRoleId =
      roleId && roleId !== "null" && String(roleId).trim() !== ""
        ? roleId
        : null;

    // --- varsa, rolun həqiqətən mövcud olduğunu yoxla (zəruri deyil amma yaxşıdır) // changed
    if (normalizedRoleId) {
      const exists = await Role.exists({ _id: normalizedRoleId });
      if (!exists) {
        return res.status(400).json({ message: "Invalid roleId" });
      }
    }

    admin.role = normalizedRoleId;
    await admin.save();

    // --- populate edib qaytar ki, UI dərhal yenilənmiş rolu görsün // changed
    await admin.populate("role");

    return res
      .status(200)
      .json({ message: "Role updated successfully", admin });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error updating role: " + err.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).populate("role");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({
      _id: admin._id,
      email: admin.email,
      role: {
        name: admin.role.name,
        permissions: admin.role.permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  updateAdminRole,
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  getAdminProfile,
};
