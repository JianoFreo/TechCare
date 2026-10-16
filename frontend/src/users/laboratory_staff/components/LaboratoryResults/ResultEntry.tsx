import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  LoaderCircle,
  Search,
  TestTubeDiagonal,
} from "lucide-react";
import type {
  AnalysisRequest,
  LaboratoryReportData,
  ReportTemplate,
  ResultValues,
} from "../../../../interface/LaboratoryAnalysis";
import { inputTypes, validateResults } from "./laboratoryValidation";
import {
  apiMessage,
  resultEntryApi,
  submitResultEntry,
} from "./laboratoryResultsApi";
import { CategoryBadge, formatLabDate } from "./AnalysisList";
import { matchingTest } from "./reportTemplates";
import { AnalysisButton, AnalysisNotice, FlaskBadge } from "./AnalysisUi";
import TemplateFields from "./TemplateFields";
import ResultSuccessOverlay from "./ResultSuccessOverlay";
import PrintResultView from "./PrintResultView";

type ResultEntryProps = {
  request: AnalysisRequest;
  onCancel: () => void;
  onSaved?: () => void;
  initialStep?: 1 | 2;
  preloadedTemplates?: readonly ReportTemplate[];
};

function applicableTemplates(
  templates: readonly ReportTemplate[],
  request: AnalysisRequest,
) {
  return templates.filter(
    (template) =>
      template.status === "Published" && matchingTest(request, template),
  );
}

function initialValues(template: ReportTemplate): ResultValues {
  return Object.fromEntries(
    template.components
      .filter((component) => inputTypes.has(component.type))
      .map((component) => [
        component.fieldKey,
        component.type === "table"
          ? []
          : component.type === "checkbox"
            ? component.settings.checkboxOptions?.length
              ? []
              : false
            : (component.settings.defaultValue ?? ""),
      ]),
  );
}

export default function ResultEntry({
  request,
  onCancel,
  onSaved,
  initialStep = 1,
  preloadedTemplates,
}: ResultEntryProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>(() =>
    applicableTemplates(preloadedTemplates ?? [], request),
  );
  const [templateId, setTemplateId] = useState(
    () =>
      applicableTemplates(preloadedTemplates ?? [], request)[0]?.form_id ?? "",
  );
  const [step, setStep] = useState(initialStep);
  const [search, setSearch] = useState("");

  const [values, setValues] = useState<ResultValues>(() => {
    const selected = applicableTemplates(preloadedTemplates ?? [], request)[0];
    return initialStep === 2 && selected ? initialValues(selected) : {};
  });

  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(preloadedTemplates === undefined);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const template = templates.find((item) => item.form_id === templateId);

  const dirty =
    !savedResultId &&
    (remarks.trim().length > 0 ||
      Object.values(values).some((value) =>
        Array.isArray(value)
          ? value.length > 0
          : value !== "" && value !== false && value != null,
      ));

  const readOnly = saving || savedResultId !== null;

  const visibleTemplates = useMemo(
    () =>
      templates.filter((item) =>
        `${item.form_name} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
      ),
    [templates, search],
  );

  const initials = (request.patientName || request.patientId)
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const editableCount =
    template?.components.filter((component) => inputTypes.has(component.type))
      .length ?? 0;

  const previewReports = useMemo<LaboratoryReportData[]>(
    () =>
      template
        ? [
            {
              request,
              template,
              values,
              remarks,
              resultId: savedResultId ?? undefined,
            },
          ]
        : [],
    [request, template, values, remarks, savedResultId],
  );

  function returnToEntry() {
    setShowPreview(false);
    requestAnimationFrame(() =>
      document.getElementById("preview-laboratory-result")?.focus(),
    );
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setFailure("");

      try {
        if (preloadedTemplates === undefined && !resultEntryApi.loadTemplates) {
          throw new Error("Report template loading is not available yet.");
        }

        const items =
          preloadedTemplates ??
          (await resultEntryApi.loadTemplates!(request, controller.signal));

        if (controller.signal.aborted) {
          return;
        }

        const published = applicableTemplates(items, request);
        setTemplates(published);
        setTemplateId(published[0]?.form_id ?? "");
        setValues(
          initialStep === 2 && published[0] ? initialValues(published[0]) : {},
        );
        setErrors({});
        setTouched(new Set());
        setSubmitted(false);
      } catch (error) {
        if (!controller.signal.aborted) {
          setTemplates([]);
          setTemplateId("");
          setFailure(
            apiMessage(error, "Unable to load published report templates."),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [request, preloadedTemplates, initialStep, reload]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    const preventLoss = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [dirty]);

  function cancel() {
    if (
      !saving &&
      (!dirty ||
        window.confirm("Discard the laboratory values entered in this form?"))
    ) {
      onCancel();
    }
  }

  function chooseTemplate(next: ReportTemplate) {
    if (
      next.form_id === templateId ||
      (dirty &&
        !window.confirm(
          "Changing the template will clear the values entered in this form. Continue?",
        ))
    ) {
      return;
    }

    setTemplateId(next.form_id);
    setValues(initialValues(next));
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
    setNotice("");
    setFailure("");
  }

  function continueToResults() {
    if (!template || !matchingTest(request, template) || !editableCount) {
      return;
    }

    if (!Object.keys(values).length) {
      setValues(initialValues(template));
    }

    setStep(2);
    setFailure("");
    setNotice("");
  }

  function showErrors(next: ResultValues, seen: Set<string>) {
    if (!template) {
      return;
    }

    const validation = validateResults(template.components, next);

    setErrors(
      Object.fromEntries(
        Object.entries(validation).filter(
          ([path]) =>
            submitted || path === "_form" || seen.has(path.split(".")[0]),
        ),
      ),
    );
  }

  function changeValue(key: string, value: unknown) {
    const next = {
      ...values,
      [key]: value,
    };

    setValues(next);
    setNotice("");

    if (submitted || touched.has(key)) {
      showErrors(next, touched);
    }
  }

  function blurField(key: string) {
    const nextTouched = new Set(touched).add(key);
    setTouched(nextTouched);
    showErrors(values, nextTouched);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();

    if (!template || readOnly) {
      return;
    }

    setSubmitted(true);
    setNotice("");
    setFailure("");
    const validation = validateResults(template.components, values);

    if (remarks.length > 5000) {
      validation._notes = "Enter at most 5,000 characters.";
    }

    setErrors(validation);

    if (Object.keys(validation).length) {
      setFailure("Please correct the highlighted fields before saving.");
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }

    if (!resultEntryApi.saveResult) {
      setNotice(
        "All fields meet the template rules. Result saving is not available yet; your entries are still in this form.",
      );

      return;
    }

    const test = matchingTest(request, template);
    setSaving(true);
    let committed = false;

    try {
      const result = await submitResultEntry({
        request_id: request.requestId,
        patient_id: request.patientId,
        lab_item_id: test?.id || null,
        service_id: test?.serviceId || template.service_id,
        form_id: template.form_id,
        template_version: template.version ?? null,
        values,
        remarks: remarks.trim(),
      });

      setNotice("Laboratory result saved successfully.");
      setSavedResultId(result.result_id);
      setShowSuccess(true);
      committed = true;
      setErrors({});
      setSubmitted(false);
      setTouched(new Set());
    } catch (error) {
      const response = (
        error as {
          response?: {
            data?: {
              errors?: Record<string, string>;
            };
          };
        }
      ).response?.data;

      if (response?.errors) {
        setErrors(response.errors);
      }

      setFailure(
        apiMessage(
          error,
          "Unable to save the result. Your entries have been kept.",
        ),
      );
    } finally {
      setSaving(false);
    }

    if (committed) {
      onSaved?.();
    }
  }

  return (
    <>
      <div hidden={showPreview}>
        <section
          className="min-w-0 bg-white font-sans text-xs text-[#253c60]"
          aria-labelledby="result-entry-heading"
        >
          <div className="flex items-center gap-4 rounded border border-[#e0eafa] px-4 py-3">
            <FlaskBadge small />
            <div>
              <h1
                className="text-lg font-bold tracking-tight outline-none"
                ref={headingRef}
                tabIndex={-1}
                id="result-entry-heading"
              >
                Enter Laboratory Result
              </h1>
              <p className="mt-1 text-[11px] leading-relaxed text-[#839abe]">
                {step === 1
                  ? "Select a published report template for the patient's laboratory request."
                  : "Input the laboratory results using the selected report template."}
              </p>
            </div>
          </div>
          <nav
            className="mt-2 flex items-center gap-3 px-1"
            aria-label="Result entry steps"
          >
            <button
              type="button"
              onClick={() => !readOnly && setStep(1)}
              aria-current={step === 1 ? "step" : undefined}
              className={`flex cursor-pointer items-center gap-2 border-b-2 pt-1 pb-3 text-[11px] text-[#188bff] disabled:cursor-not-allowed ${step === 1 ? "border-[#188bff]" : "border-[#dbeafb]"}`}
              disabled={readOnly}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-[#188bff] text-white">
                {step === 2 ? <Check size={16} /> : "1"}
              </span>
              1. Choose Report Template
            </button>
            <i className="mb-2 hidden h-px w-4 bg-[#e1ecfa] sm:block" />
            <button
              type="button"
              onClick={continueToResults}
              disabled={step === 1 || readOnly}
              aria-current={step === 2 ? "step" : undefined}
              className={`flex items-center gap-2 border-b-2 pt-1 pb-3 text-[11px] ${step === 2 ? "border-[#188bff] text-[#188bff]" : "border-transparent text-[#869dc0]"}`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full font-semibold ${step === 2 ? "bg-[#188bff] text-white" : "bg-[#f0f6fe]"}`}
              >
                2
              </span>
              2. Input Results
            </button>
          </nav>
          <div className="grid min-h-[620px] grid-cols-1 items-start gap-4 rounded border border-[#e0eafa] p-3 xl:grid-cols-[minmax(270px,35%)_minmax(0,1fr)]">
            <aside className="min-w-0 overflow-hidden rounded border border-[#dce9fa] bg-white">
              <h2 className="bg-[#f0f7fd] p-3 text-xs font-semibold">
                Patient & Request Information
              </h2>
              <div className="px-3 pt-2.5 pb-1.5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e2f5ff] text-base font-semibold text-[#24b4f6]">
                    {initials || "—"}
                  </span>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold">
                      {request.patientName || "Name not provided"}
                    </h3>
                    <p className="text-[10px] text-[#859bbe]">
                      {request.patientId}
                      {" · "}
                      {request.age === null
                        ? "Age not provided"
                        : `${request.age} yrs`}
                      {" · "}
                      {request.sex || "Sex not provided"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {request.category !== "Normal" && (
                        <CategoryBadge request={request} compact />
                      )}
                      {request.sex && (
                        <span className="rounded-full bg-[#e3f5ff] px-2 py-px text-[10px] text-[#32a7df]">
                          {request.sex}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <dl className="mb-4 grid grid-cols-3 gap-2 text-[9px] [&_dt]:mb-1 [&_dt]:text-[#8ca0bd] [&_dd]:leading-relaxed [&_dd]:wrap-anywhere [&>div+div]:border-l [&>div+div]:border-[#e5edf8] [&>div+div]:pl-2">
                  <div>
                    <dt>Request No.</dt>
                    <dd>{request.requestId}</dd>
                  </div>
                  <div>
                    <dt>Consultation Type</dt>
                    <dd>{request.consultationType}</dd>
                  </div>
                  <div>
                    <dt>Request Date & Time</dt>
                    <dd>{formatLabDate(request.requestedAt)}</dd>
                  </div>
                </dl>
                <details className="rounded-sm bg-[#eff7fd] p-2.5">
                  <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                    <TestTubeDiagonal
                      className="shrink-0 text-[#189dff]"
                      size={17}
                      strokeWidth={1.2}
                    />
                    <div>
                      <span className="text-[10px] text-[#8da1bd]">
                        Requested Tests
                      </span>
                      <p className="mt-0.5 text-[10px]">
                        {request.tests.map((test) => test.name).join(", ") ||
                          "Not specified"}
                      </p>
                    </div>
                    <ChevronDown
                      className="ml-auto shrink-0 text-[#8fa9cd]"
                      size={13}
                    />
                  </summary>
                  <ul className="mt-2 list-disc pl-7 text-[10px] leading-relaxed">
                    {request.tests.map((test, index) => (
                      <li key={test.id || `${test.name}-${index}`}>
                        {test.name}
                      </li>
                    ))}
                  </ul>
                </details>
                <p className="flex flex-wrap items-center gap-1 pt-2 text-[9px] text-[#86a0ba]">
                  <Check size={12} className="text-green-500" />
                  Samples collected
                  {request.collectedAt && (
                    <span>
                      {" · "}
                      {formatLabDate(request.collectedAt)}
                    </span>
                  )}
                </p>
              </div>
            </aside>
            {step === 1 || !template ? (
              <section
                className="min-w-0 overflow-hidden rounded border border-[#dce9fa] bg-white"
                aria-labelledby="report-template-heading"
              >
                <h2
                  className="bg-[#f0f7fd] p-3 text-xs font-semibold"
                  id="report-template-heading"
                >
                  Report Template
                </h2>
                <div className="p-3">
                  <label className="mb-3 flex h-8 items-center gap-2 rounded-sm border border-[#dce7f8] px-2.5 text-[#8ca1bd] focus-within:border-sky-400">
                    <Search size={14} />
                    <input
                      className="w-full min-w-0 border-0 bg-transparent text-[11px] outline-none placeholder:text-[#91a4c1]"
                      aria-label="Search report templates"
                      placeholder="Search templates..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  {loading ? (
                    <p className="flex min-h-48 items-center justify-center gap-2 text-[#8099ba]">
                      <LoaderCircle
                        className="animate-spin motion-reduce:animate-none"
                        size={20}
                      />
                      Loading published templates...
                    </p>
                  ) : (
                    <div
                      className="flex flex-col gap-1.5"
                      role="radiogroup"
                      aria-label="Report template"
                    >
                      {visibleTemplates.map((item) => (
                        <label
                          key={item.form_id}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 ${templateId === item.form_id ? "border-[#96c8ff] bg-[#eaf4ff] text-[#188bff]" : "border-[#dce7f8] hover:border-sky-300"}`}
                        >
                          <input
                            className="size-3 shrink-0 accent-[#188bff]"
                            type="radio"
                            name="report-template"
                            value={item.form_id}
                            checked={templateId === item.form_id}
                            onChange={() => chooseTemplate(item)}
                          />
                          <div>
                            <strong className="block text-[11px] font-medium">
                              {item.form_name}
                            </strong>
                            <small className="mt-0.5 block text-[10px] text-[#8fa3c1]">
                              {item.category}
                            </small>
                          </div>
                          <span className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0f7fd] text-[#8ea8c9]">
                            <TestTubeDiagonal size={17} strokeWidth={1.4} />
                          </span>
                          <ChevronRight size={14} />
                        </label>
                      ))}
                      {!visibleTemplates.length && !failure && (
                        <p className="flex min-h-40 items-center justify-center p-5 text-center text-[#8099ba]">
                          {search
                            ? "No templates match your search."
                            : "No published templates match the requested tests."}
                        </p>
                      )}
                    </div>
                  )}
                  {failure && (
                    <>
                      <AnalysisNotice error>{failure}</AnalysisNotice>
                      <AnalysisButton
                        variant="secondary"
                        disabled={loading}
                        onClick={() => setReload((value) => value + 1)}
                      >
                        Reload templates
                      </AnalysisButton>
                    </>
                  )}
                </div>
                <footer className="flex items-center justify-between gap-3 border-t border-[#e0eafa] p-3">
                  <AnalysisButton variant="secondary" onClick={cancel}>
                    Cancel
                  </AnalysisButton>
                  <AnalysisButton
                    disabled={loading || !template || !editableCount}
                    onClick={continueToResults}
                  >
                    Continue
                    <ChevronRight size={13} />
                  </AnalysisButton>
                </footer>
              </section>
            ) : (
              <form
                ref={formRef}
                className="min-w-0 overflow-hidden rounded border border-[#dce9fa] bg-white"
                onSubmit={save}
                noValidate
                aria-label={`${template.form_name} results`}
              >
                <header className="flex items-center gap-3 bg-[#f0f7fd] p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e0f4ff] text-[#189dff]">
                    <TestTubeDiagonal size={21} strokeWidth={1.4} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">
                      {template.form_name}
                    </h2>
                    <p className="mt-1 text-[10px] text-[#8ca2c2]">
                      {template.category}
                      {" · "}
                      {editableCount}
                      {" Parameters"}
                    </p>
                  </div>
                  <span className="ml-auto hidden rounded-sm bg-[#e0f4ff] px-2 py-1 text-[9px] text-[#31b5ef] sm:block">
                    {template.form_id}
                  </span>
                </header>
                <div className="px-3 pt-4 pb-3">
                  {failure && <AnalysisNotice error>{failure}</AnalysisNotice>}
                  {notice && <AnalysisNotice>{notice}</AnalysisNotice>}
                  {errors._form && (
                    <p role="alert" className="mb-2 text-[11px] text-rose-700">
                      {errors._form}
                    </p>
                  )}
                  <TemplateFields
                    components={template.components}
                    values={values}
                    errors={errors}
                    onChange={changeValue}
                    onBlur={blurField}
                    disabled={readOnly}
                  />
                  <div>
                    <h3 className="mb-2 text-xs font-semibold">
                      Additional Notes
                    </h3>
                    <label
                      className="mb-1.5 block text-[10px] text-[#8a9fbd]"
                      htmlFor="laboratory-notes"
                    >
                      Notes / Observations
                    </label>
                    <textarea
                      className="min-h-14 w-full resize-y rounded-sm border border-[#dce7f8] px-2.5 py-2 text-[11px] text-[#304a71] outline-none placeholder:text-[#8ca1bf] focus:border-sky-400 focus:ring-2 focus:ring-sky-50 aria-invalid:border-rose-400"
                      id="laboratory-notes"
                      rows={3}
                      value={remarks}
                      maxLength={5000}
                      disabled={readOnly}
                      placeholder="Enter remarks or additional observations..."
                      onChange={(event) => {
                        setRemarks(event.target.value);
                        setNotice("");
                      }}
                      aria-invalid={Boolean(errors._notes)}
                      aria-describedby={
                        errors._notes ? "laboratory-notes-error" : undefined
                      }
                    />
                    {errors._notes && (
                      <p
                        id="laboratory-notes-error"
                        className="mt-1 text-[10px] text-rose-700"
                      >
                        {errors._notes}
                      </p>
                    )}
                  </div>
                  {!resultEntryApi.saveResult && (
                    <p className="pt-2 text-[10px] leading-relaxed text-[#8098b8]">
                      Saving is not available yet. You can enter and validate
                      results in this form.
                    </p>
                  )}
                </div>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e0eafa] p-3">
                  <AnalysisButton
                    variant="secondary"
                    disabled={saving}
                    onClick={cancel}
                  >
                    Cancel
                  </AnalysisButton>
                  <AnalysisButton
                    variant="link"
                    className="ml-auto"
                    disabled={readOnly}
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={13} />
                    Change template
                  </AnalysisButton>
                  <AnalysisButton
                    variant="secondary"
                    id="preview-laboratory-result"
                    disabled={saving}
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye size={13} />
                    Preview
                  </AnalysisButton>
                  <AnalysisButton type="submit" disabled={readOnly}>
                    {saving && (
                      <LoaderCircle
                        size={14}
                        className="animate-spin motion-reduce:animate-none"
                      />
                    )}
                    {saving
                      ? "Saving..."
                      : savedResultId
                        ? "Saved"
                        : "Save Result"}
                  </AnalysisButton>
                </footer>
              </form>
            )}
          </div>
          <ResultSuccessOverlay
            open={showSuccess}
            onClose={() => setShowSuccess(false)}
            returnFocusRef={headingRef}
            onBackToList={() => {
              setShowSuccess(false);
              onCancel();
            }}
          />
        </section>
      </div>
      {showPreview && template && (
        <PrintResultView
          request={request}
          reports={previewReports}
          onBack={returnToEntry}
          backLabel="Back to Entry"
          onBackToList={onCancel}
        />
      )}
    </>
  );
}
