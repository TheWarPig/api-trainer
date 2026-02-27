'use client';

import type { ValidationCondition, ValidationSchema, ConditionOperator } from '@/lib/types';

interface ValidationBuilderProps {
  conditions: ValidationSchema;
  onChange: (conditions: ValidationSchema) => void;
}

const FIELD_OPTIONS: { value: ValidationCondition['field']; label: string; needsKey: boolean; needsOperator: boolean }[] = [
  { value: 'method',                      label: 'HTTP Method',              needsKey: false, needsOperator: false },
  { value: 'url.pathname',                label: 'URL Pathname (exact)',     needsKey: false, needsOperator: false },
  { value: 'url.pathnameRegex',           label: 'URL Pathname (regex)',     needsKey: false, needsOperator: false },
  { value: 'url.queryParam',              label: 'Query Parameter',          needsKey: true,  needsOperator: true },
  { value: 'requestHeader',               label: 'Request Header',          needsKey: true,  needsOperator: true },
  { value: 'requestHeaderAbsent',         label: 'Header Must Be Absent',   needsKey: true,  needsOperator: false },
  { value: 'statusCode',                  label: 'Status Code',             needsKey: false, needsOperator: false },
  { value: 'responseBody.isArray',        label: 'Response Is Array',       needsKey: false, needsOperator: false },
  { value: 'responseBody.arrayMinLength', label: 'Array Min Length',        needsKey: false, needsOperator: false },
  { value: 'responseBody.property',       label: 'Response Property',       needsKey: true,  needsOperator: true },
  { value: 'responseBody.propertyType',   label: 'Property Type',           needsKey: true,  needsOperator: false },
  { value: 'responseBody.arrayContains',  label: 'Array Contains Item',     needsKey: true,  needsOperator: true },
];

const METHOD_VALUES = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals',     label: 'Equals' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'contains',   label: 'Contains' },
  { value: 'exists',     label: 'Exists' },
  { value: 'regex',      label: 'Regex' },
];

function getFieldMeta(field: ValidationCondition['field']) {
  return FIELD_OPTIONS.find(f => f.value === field);
}

export default function ValidationBuilder({ conditions, onChange }: ValidationBuilderProps) {
  const update = (index: number, patch: Partial<ValidationCondition>) => {
    const next = [...conditions];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...conditions, { field: 'method', value: 'GET' }]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...conditions];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === conditions.length - 1) return;
    const next = [...conditions];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const renderValueInput = (cond: ValidationCondition, index: number) => {
    const { field } = cond;

    // Method: dropdown
    if (field === 'method') {
      return (
        <select
          value={String(cond.value || 'GET')}
          onChange={e => update(index, { value: e.target.value })}
          className="flex-1 min-w-[100px] px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
        >
          {METHOD_VALUES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      );
    }

    // Status code: number
    if (field === 'statusCode') {
      return (
        <input
          type="number"
          value={cond.value as number || ''}
          onChange={e => update(index, { value: Number(e.target.value) })}
          placeholder="200"
          className="flex-1 min-w-[80px] px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
        />
      );
    }

    // isArray: boolean dropdown
    if (field === 'responseBody.isArray') {
      return (
        <select
          value={cond.value === false ? 'false' : 'true'}
          onChange={e => update(index, { value: e.target.value === 'true' })}
          className="flex-1 min-w-[80px] px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
        >
          <option value="true">Yes (is array)</option>
          <option value="false">No (not array)</option>
        </select>
      );
    }

    // arrayMinLength: number
    if (field === 'responseBody.arrayMinLength') {
      return (
        <input
          type="number"
          value={cond.value as number || ''}
          onChange={e => update(index, { value: Number(e.target.value) })}
          placeholder="1"
          className="flex-1 min-w-[80px] px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
        />
      );
    }

    // propertyType: type dropdown
    if (field === 'responseBody.propertyType') {
      return (
        <select
          value={String(cond.value || 'string')}
          onChange={e => update(index, { value: e.target.value })}
          className="flex-1 min-w-[80px] px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="array">array</option>
          <option value="object">object</option>
          <option value="boolean">boolean</option>
        </select>
      );
    }

    // headerAbsent: no value needed
    if (field === 'requestHeaderAbsent') {
      return null;
    }

    // Default: text input
    return (
      <input
        type="text"
        value={cond.value !== undefined ? String(cond.value) : ''}
        onChange={e => {
          // Try to parse as number for property equality checks
          const raw = e.target.value;
          const num = Number(raw);
          const val = raw !== '' && !isNaN(num) && field !== 'url.pathname' && field !== 'url.pathnameRegex' && field !== 'requestHeader' ? num : raw;
          update(index, { value: val });
        }}
        placeholder="Value"
        className="flex-1 min-w-[120px] px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--color-text-dimmed)]">
          All conditions must pass (AND logic)
        </p>
        <button
          type="button"
          onClick={add}
          className="text-xs px-3 py-1 rounded bg-[#FF6C37] text-white hover:bg-[#e55e2f] transition-colors"
        >
          + Add Condition
        </button>
      </div>

      {conditions.length === 0 && (
        <div className="text-center py-6 text-xs text-[var(--color-text-faint)]">
          No validation conditions. Add one to define how this level is validated.
        </div>
      )}

      {conditions.map((cond, i) => {
        const meta = getFieldMeta(cond.field);
        return (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded border bg-[var(--color-bg-panel)] border-[var(--color-border-secondary)] flex-wrap"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="text-[10px] text-[var(--color-text-dimmed)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === conditions.length - 1}
                className="text-[10px] text-[var(--color-text-dimmed)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
              >
                ▼
              </button>
            </div>

            {/* Field selector */}
            <select
              value={cond.field}
              onChange={e => {
                const newField = e.target.value as ValidationCondition['field'];
                update(i, { field: newField, key: undefined, operator: undefined, value: undefined });
              }}
              className="px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
            >
              {FIELD_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>

            {/* Key input (if needed) */}
            {meta?.needsKey && (
              <input
                type="text"
                value={cond.key || ''}
                onChange={e => update(i, { key: e.target.value })}
                placeholder="Key name"
                className="w-32 px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
              />
            )}

            {/* Operator selector (if needed) */}
            {meta?.needsOperator && (
              <select
                value={cond.operator || 'equals'}
                onChange={e => update(i, { operator: e.target.value as ConditionOperator })}
                className="px-2 py-1.5 text-xs rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)]"
              >
                {OPERATOR_OPTIONS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            )}

            {/* Value input */}
            {renderValueInput(cond, i)}

            {/* Delete button */}
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-auto text-xs text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-red-400/10 transition-colors"
              title="Remove condition"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
