const { Role } = require("../models/role");

const allPermissions = require("../config/permissions");

// Yeni rol oluşturma
const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (name.toLowerCase() === "super_admin") {
      return res.status(400).json({ message: "Super admin oluşturulamaz!" });
    }

    const role = new Role({ name, permissions });

    await role.save();
    res.status(201).json({ message: "Role created successfully", role });
  } catch (err) {
    res.status(500).json({ message: "Error creating role: " + err.message });
  }
};

// Tüm rolleri listeleme
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ name: { $ne: "super_admin" } });

    // super_admin için izinleri runtime'da ekle
    const updatedRoles = roles.map((role) => {
      const roleObj = role.toObject();
      if (roleObj.name === "super_admin") {
        roleObj.permissions = allPermissions;
      }
      return roleObj;
    });

    res.status(200).json(updatedRoles);
  } catch (err) {
    res.status(500).json({ message: "Error fetching roles: " + err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    if (name) role.name = name;
    if (permissions) role.permissions = permissions;

    await role.save();

    res.status(200).json({ message: "Role updated successfully", role });
  } catch (err) {
    res.status(500).json({ message: "Error updating role: " + err.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    if (role.name === "super_admin") {
      return res.status(400).json({ message: "super_admin rolü silinemez!" });
    }

    await Role.findByIdAndDelete(id);
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting role: " + err.message });
  }
};

module.exports = { createRole, getRoles, updateRole, deleteRole };
