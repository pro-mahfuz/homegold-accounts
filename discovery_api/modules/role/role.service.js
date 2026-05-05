import { Role, Permission } from "../../models/model.js";

const EXCLUDED_PERMISSION_TERMS = ["bill", "container", "invoice", "customer", "supplier"];
const EXCLUDED_PERMISSION_ACTIONS = [
    "report_daily_profit",
    "report_profit",
    "report_sale_cash",
    "report_sale_outstanding",
    "report_sale_statement",
];
const EXCLUDED_PERMISSION_ACTION_FRAGMENTS = ["sale_2", "payment_2"];

const shouldExcludePermission = (permission) => {
    const action = String(permission?.action ?? "").toLowerCase();
    const values = [permission?.group, permission?.name, permission?.action]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

    if (EXCLUDED_PERMISSION_ACTIONS.includes(action)) {
        return true;
    }

    if (EXCLUDED_PERMISSION_ACTION_FRAGMENTS.some((fragment) => action.includes(fragment))) {
        return true;
    }

    return values.some((value) =>
        EXCLUDED_PERMISSION_TERMS.some((term) => value.includes(term))
    );
};

export const getAllRoles = async () => {
    const roles = await Role.findAll({ include: [ 
        {model: Permission, as: "permissions"}
    ]});

    if (!roles || roles.length === 0) throw { status: 400, message: "No roles found" };
    
    return roles.map((role) => {
        const roleData = role.toJSON();

        return {
            ...roleData,
            permissions: (roleData.permissions ?? []).filter(
                (permission) => !shouldExcludePermission(permission)
            ),
        };
    });
}

export const activeRole = async (id) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw { status: 404, message: "Role not found" };
    }

    role.isActive = true;
    await role.save();
    return role;
}

export const deactiveRole = async (id) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw { status: 404, message: "Role not found" };
    }

    role.isActive = false;
    await role.save();
    return role;
}

export const deleteRole = async (id) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw { status: 404, message: "Role not found" };
    }

    console.log("role: ", role);

    if (role.Permission) {
        throw { status: 404, message: "Can't delete, role has already permissions" };
    }

    role.destroy();
    return role;
}
