import type { BuilderComponent } from "../../../../interface/FormTemplate";
import type { ResultValues } from "../../../../interface/LaboratoryAnalysis";
import { Plus, X } from "lucide-react";
import { inputTypes, resultFlag } from "./laboratoryValidation";
import { AnalysisButton } from "./AnalysisUi";

type TemplateFieldsProps = {
  components: BuilderComponent[];
  values: ResultValues;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  onBlur: (key: string) => void;
  disabled?: boolean;
};

const limit = (value: string | number | undefined) =>
  value === "" || value === undefined ? undefined : Number(value);
const inputClass =
  "h-7 w-full min-w-0 rounded-sm border border-[#dce7f8] bg-white px-2 py-1 text-[11px] text-[#304a71] outline-none placeholder:text-[#a3b3c9] focus:border-sky-400 focus:ring-2 focus:ring-sky-50 aria-invalid:border-rose-400 aria-invalid:bg-rose-50 disabled:opacity-50";
const errorClass = "mt-1 text-[10px] leading-relaxed text-rose-700";

type FieldInputProps = {
  component: BuilderComponent;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  disabled?: boolean;
};

function FieldInput({
  component,
  value,
  error,
  onChange,
  onBlur,
  disabled,
}: FieldInputProps) {
  const { fieldKey: key, settings, validation: rules } = component;

  const id = `result-${key}`;
  const type =
    component.type === "date_field"
      ? "date"
      : component.type === "number_field" || rules.inputType === "Number"
        ? "number"
        : rules.inputType === "Email"
          ? "email"
          : rules.inputType === "Date"
            ? "date"
            : "text";

  return (
    <input
      id={id}
      name={key}
      className={inputClass}
      type={type}
      value={
        typeof value === "string" || typeof value === "number" ? value : ""
      }
      required={Boolean(settings.required || rules.required)}
      min={type === "date" ? rules.earliestDate : limit(rules.minValue)}
      max={type === "date" ? rules.latestDate : limit(rules.maxValue)}
      step={
        type === "number" && limit(rules.decimalPlaces) !== undefined
          ? 10 ** -Number(rules.decimalPlaces)
          : "any"
      }
      minLength={limit(rules.minLength)}
      maxLength={limit(rules.maxLength)}
      placeholder={settings.placeholder || "Enter result"}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    />
  );
}

type TableFieldProps = {
  component: BuilderComponent;
  value: unknown;
  errors: Record<string, string>;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  disabled?: boolean;
};

function TableField({
  component,
  value,
  errors,
  onChange,
  onBlur,
  disabled,
}: TableFieldProps) {
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const columns = component.settings.tableColumns ?? [];
  const key = component.fieldKey;
  const maximum = limit(component.validation.tableRules?.maxRows);

  return (
    <div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[300px] border-collapse text-left text-[10px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  className="bg-[#f0f7fd] p-2 font-medium text-[#8298b6]"
                  scope="col"
                  key={column.id}
                >
                  {column.header}
                </th>
              ))}
              <th className="bg-[#f0f7fd] p-2" scope="col">
                <span className="sr-only">Remove row</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => {
                  const path = `${key}.${index}.${column.id}`;

                  return (
                    <td
                      className="border-b border-[#eff4fa] p-1.5"
                      key={column.id}
                    >
                      <input
                        className={inputClass}
                        type={column.type}
                        step={column.type === "number" ? "any" : undefined}
                        aria-label={`${component.label}, row ${index + 1}, ${column.header}`}
                        value={String(row[column.id] ?? "")}
                        aria-invalid={Boolean(errors[path])}
                        aria-describedby={
                          errors[path] ? `${path}-error` : undefined
                        }
                        onBlur={onBlur}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(
                            rows.map((current, rowIndex) =>
                              rowIndex === index
                                ? {
                                    ...current,
                                    [column.id]: event.target.value,
                                  }
                                : current,
                            ),
                          )
                        }
                      />
                      {errors[path] && (
                        <p className={errorClass} id={`${path}-error`}>
                          {errors[path]}
                        </p>
                      )}
                    </td>
                  );
                })}
                <td className="border-b border-[#eff4fa] p-1.5">
                  <AnalysisButton
                    variant="link"
                    compact
                    disabled={disabled}
                    aria-label={`Remove row ${index + 1} from ${component.label}`}
                    onClick={() =>
                      onChange(rows.filter((_, rowIndex) => index !== rowIndex))
                    }
                  >
                    <X size={14} />
                  </AnalysisButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnalysisButton
        variant="link"
        compact
        className="mt-1"
        disabled={disabled || (maximum !== undefined && rows.length >= maximum)}
        onClick={() => onChange([...rows, {}])}
      >
        <Plus size={13} />
        Add row
      </AnalysisButton>
    </div>
  );
}

export default function TemplateFields({
  components,
  values,
  errors,
  onChange,
  onBlur,
  disabled,
}: TemplateFieldsProps) {
  const groups: {
    title: string;
    key: string;
    components: BuilderComponent[];
  }[] = [];

  for (const component of [...components].sort((a, b) => a.order - b.order)) {
    if (component.type === "section_header") {
      groups.push({
        title: component.settings.sectionHeader || component.label,
        key: component.id,
        components: [],
      });
    } else {
      if (!groups.length) {
        groups.push({
          title: "Results",
          key: "results",
          components: [],
        });
      }

      groups[groups.length - 1].components.push(component);
    }
  }

  return (
    <>
      {groups.map((group) => (
        <section key={group.key} className="mb-5" aria-label={group.title}>
          <h3 className="mb-1.5 text-xs font-semibold">{group.title}</h3>
          <div
            className="hidden grid-cols-[1.15fr_1.6fr_1.1fr_.42fr] gap-3 bg-[#f0f7fd] px-2 py-1.5 text-[10px] text-[#7f98bb] sm:grid"
            aria-hidden="true"
          >
            <span>Parameter</span>
            <span>Result</span>
            <span>Reference Range</span>
            <span>Unit</span>
          </div>
          {group.components.map((component) => {
            const { fieldKey: key, settings, validation: rules } = component;

            const alignment =
              settings.alignment === "center"
                ? "text-center"
                : settings.alignment === "right"
                  ? "text-right"
                  : "text-left";

            if (component.type === "static_text") {
              return (
                <p
                  className={`p-2 text-[11px] leading-relaxed whitespace-pre-wrap text-[#7790b0] ${alignment}`}
                  key={component.id}
                >
                  {settings.staticText || component.label}
                </p>
              );
            }

            if (component.type === "line_divider") {
              return (
                <hr
                  className={`my-3 border-[#e0eafa] ${settings.dividerStyle === "dashed" ? "border-dashed" : settings.dividerStyle === "dotted" ? "border-dotted" : "border-solid"}`}
                  key={component.id}
                />
              );
            }

            if (component.type === "image") {
              return settings.imageUrl ? (
                <img
                  className="max-h-40 max-w-full object-contain p-2"
                  key={component.id}
                  src={settings.imageUrl}
                  alt={settings.imageAlt || component.label}
                />
              ) : null;
            }

            if (!inputTypes.has(component.type)) {
              return (
                <p className={errorClass} key={component.id}>
                  {"Unsupported template field: "}
                  {component.label}
                </p>
              );
            }

            const flag = resultFlag(component, values[key]);
            const reference =
              settings.referenceRange ||
              (rules.refLow !== undefined && rules.refHigh !== undefined
                ? `${rules.refLow} - ${rules.refHigh}`
                : "—");
            const error = errors[key];

            if (component.type === "checkbox" || component.type === "table") {
              return (
                <div
                  className="border-b border-[#eff4fa] px-2 py-3"
                  key={component.id}
                >
                  <fieldset
                    className="m-0 min-w-0 border-0 p-0"
                    disabled={disabled}
                    onBlur={() => onBlur(key)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `result-${key}-error` : undefined}
                  >
                    <legend className="mb-2 text-xs">
                      {component.label}
                      {(settings.required || rules.required) && (
                        <span className="text-[#8a9cb6]">{" *"}</span>
                      )}
                    </legend>
                    {component.type === "table" ? (
                      <TableField
                        component={component}
                        value={values[key]}
                        errors={errors}
                        onChange={(value) => onChange(key, value)}
                        onBlur={() => onBlur(key)}
                        disabled={disabled}
                      />
                    ) : settings.checkboxOptions?.length ? (
                      <div className="flex flex-wrap gap-3 text-[11px]">
                        {settings.checkboxOptions.map((option) => {
                          const selected = Array.isArray(values[key])
                            ? (values[key] as string[])
                            : [];

                          return (
                            <label
                              className="flex items-center gap-1.5"
                              key={option}
                            >
                              <input
                                className="accent-[#188bff]"
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={(event) =>
                                  onChange(
                                    key,
                                    event.target.checked
                                      ? [...selected, option]
                                      : selected.filter(
                                          (item) => item !== option,
                                        ),
                                  )
                                }
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <label className="flex items-center gap-1.5 text-[11px]">
                        <input
                          className="accent-[#188bff]"
                          type="checkbox"
                          checked={values[key] === true}
                          onChange={(event) =>
                            onChange(key, event.target.checked)
                          }
                        />
                        {settings.placeholder || "Yes"}
                      </label>
                    )}
                  </fieldset>
                  {error && (
                    <p className={errorClass} id={`result-${key}-error`}>
                      {error}
                    </p>
                  )}
                </div>
              );
            }

            return (
              <div
                className="grid grid-cols-2 items-center gap-x-3 gap-y-1 border-b border-[#eff4fa] px-2 py-2 text-[11px] sm:grid-cols-[1.15fr_1.6fr_1.1fr_.42fr] sm:py-1.5"
                key={component.id}
              >
                <label htmlFor={`result-${key}`}>
                  {component.label}
                  {(settings.required || rules.required) && (
                    <span className="text-[9px] text-[#8a9cb6]">{" *"}</span>
                  )}
                </label>
                <div className="relative min-w-0">
                  <FieldInput
                    component={component}
                    value={values[key]}
                    error={error}
                    onChange={(value) => onChange(key, value)}
                    onBlur={() => onBlur(key)}
                    disabled={disabled}
                  />
                  {error && (
                    <p className={errorClass} id={`result-${key}-error`}>
                      {error}
                    </p>
                  )}
                  {flag && !error && (
                    <span
                      className={`mt-1 inline-block rounded-sm px-1 text-[9px] ${flag === (rules.flagLabels?.normal || "Normal") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {flag}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#8ba0c1]">
                  <span className="sm:hidden">{"Reference: "}</span>
                  {reference}
                </span>
                <span className="text-[10px] text-[#8ba0c1]">
                  {settings.unit || "—"}
                </span>
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
