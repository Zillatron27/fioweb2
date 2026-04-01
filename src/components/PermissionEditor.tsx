import type { Permissions } from '../types/permissions';
import { countCategoryEnabled } from '../types/permissions';
import styles from './PermissionEditor.module.css';

interface PermissionEditorProps {
  permissions: Permissions;
  onChange?: (permissions: Permissions) => void;
  readOnly?: boolean;
}

interface CategoryConfig {
  key: keyof Permissions;
  label: string;
  fields: { key: string; label: string }[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'ShipPermissions',
    label: 'Ship',
    fields: [
      { key: 'ShipInformation', label: 'Information' },
      { key: 'ShipRepair', label: 'Repair' },
      { key: 'ShipFlight', label: 'Flight' },
      { key: 'ShipInventory', label: 'Inventory' },
      { key: 'ShipFuelInventory', label: 'Fuel Inventory' },
    ],
  },
  {
    key: 'SitesPermissions',
    label: 'Sites',
    fields: [
      { key: 'SitesLocation', label: 'Location' },
      { key: 'SitesWorkforces', label: 'Workforces' },
      { key: 'SitesExperts', label: 'Experts' },
      { key: 'SitesBuildings', label: 'Buildings' },
      { key: 'SitesRepair', label: 'Repair' },
      { key: 'SitesReclaimable', label: 'Reclaimable' },
      { key: 'SitesProductionLines', label: 'Production Lines' },
    ],
  },
  {
    key: 'StoragePermissions',
    label: 'Storage',
    fields: [
      { key: 'StorageLocation', label: 'Location' },
      { key: 'StorageInformation', label: 'Information' },
      { key: 'StorageItems', label: 'Items' },
    ],
  },
  {
    key: 'TradePermissions',
    label: 'Trade',
    fields: [
      { key: 'TradeContract', label: 'Contracts' },
      { key: 'TradeCXOS', label: 'CX Orders' },
    ],
  },
  {
    key: 'CompanyPermissions',
    label: 'Company',
    fields: [
      { key: 'CompanyInfo', label: 'Info' },
      { key: 'CompanyLiquidCurrency', label: 'Liquid Currency' },
      { key: 'CompanyHeadquarters', label: 'Headquarters' },
    ],
  },
  {
    key: 'MiscPermissions',
    label: 'Misc',
    fields: [
      { key: 'MiscShipmentTracking', label: 'Shipment Tracking' },
    ],
  },
];

export function PermissionEditor({ permissions, onChange, readOnly = false }: PermissionEditorProps) {
  const getCategory = (categoryKey: keyof Permissions): Record<string, boolean> => {
    return permissions[categoryKey] as unknown as Record<string, boolean>;
  };

  const handleToggle = (categoryKey: keyof Permissions, fieldKey: string, value: boolean) => {
    if (readOnly || !onChange) return;
    const category = getCategory(categoryKey);
    onChange({
      ...permissions,
      [categoryKey]: { ...category, [fieldKey]: value },
    });
  };

  const handleSelectAll = (categoryKey: keyof Permissions, selectAll: boolean) => {
    if (readOnly || !onChange) return;
    const category = getCategory(categoryKey);
    const updated: Record<string, boolean> = {};
    for (const key of Object.keys(category)) {
      updated[key] = selectAll;
    }
    onChange({
      ...permissions,
      [categoryKey]: updated,
    });
  };

  return (
    <div className={styles.grid}>
      {CATEGORIES.map((cat) => {
        const category = getCategory(cat.key);
        const enabled = countCategoryEnabled(category);
        const total = cat.fields.length;
        const allSelected = enabled === total;

        return (
          <div key={cat.key} className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryLabel}>{cat.label}</span>
              <span className={styles.categoryCount}>
                {enabled}/{total}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  className={styles.selectAll}
                  onClick={() => handleSelectAll(cat.key, !allSelected)}
                >
                  {allSelected ? 'Clear' : 'All'}
                </button>
              )}
            </div>
            <div className={styles.fields}>
              {cat.fields.map((field) => {
                const checked = category[field.key] ?? false;
                const id = `perm-${cat.key}-${field.key}`;
                return (
                  <label key={field.key} htmlFor={id} className={styles.field}>
                    <span className={styles.fieldLabel}>{field.label}</span>
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleToggle(cat.key, field.key, e.target.checked)}
                      disabled={readOnly}
                      className={styles.checkbox}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
