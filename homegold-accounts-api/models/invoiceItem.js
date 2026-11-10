// models/InvoiceItem.js
export default (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define("InvoiceItem", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uniqueId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0.01 },
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    vatPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 },
    },
    subTotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    itemVat: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    itemGrandTotal: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    system: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  }, {
    tableName: "invoiceitems",
    timestamps: true,
    underscored: false,
  });

  InvoiceItem.associate = (models) => {
    InvoiceItem.belongsTo(models.Invoice, {
      foreignKey: "invoiceId",
      as: "invoice",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    InvoiceItem.belongsTo(models.Item, {
      foreignKey: "itemId",
      as: "item",
    });
    InvoiceItem.belongsTo(models.Warehouse, {
      foreignKey: "warehouseId",
      as: "warehouse",
    });
  };

  return InvoiceItem;
};
