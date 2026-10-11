import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { useCreateTemplate, useUpdateTemplate, useTemplateHistory, useTemplate } from '../hooks/useNotificationTemplates';

export default function NotificationTemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const { mutateAsync: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateTemplate(id || '');
  const { data: historyData } = useTemplateHistory(id || '', { page: 1, limit: 10 });
  const { data: templateData } = useTemplate(id || '');

  // Header / general metadata
  const [name, setName] = useState('Payment notifications');
  const [trigger, setTrigger] = useState('payment_completed');
  const [templateType, setTemplateType] = useState('SYSTEM');
  const [templateState, setTemplateState] = useState('ENABLED');
  const [versionLabel, setVersionLabel] = useState('3.2');
  const [language, setLanguage] = useState('en-IN');

  // Channel variants
  const [currentChannel, setCurrentChannel] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');

  // Email variant state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailSubject, setEmailSubject] = useState("You're enrolled in {{course_name}}");
  const [emailEditorValue, setEmailEditorValue] = useState<Descendant[]>([
    { type: 'paragraph', children: [{ text: '' }] },
  ]);
  const [ctaLabel, setCtaLabel] = useState('Open my course');
  const [ctaUrl, setCtaUrl] = useState('{{course_portal_url}}');

  // SMS variant state
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsBody, setSmsBody] = useState('');
  const [dltTemplateId, setDltTemplateId] = useState('');

  // WhatsApp variant state
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappBody, setWhatsappBody] = useState('');
  const [whatsappCtaLabel, setWhatsappCtaLabel] = useState('Open my course');
  const [whatsappCtaUrl, setWhatsappCtaUrl] = useState('{{course_portal_url}}');

  const [previewText, setPreviewText] = useState('');
  const [isLoaded, setIsLoaded] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (templateData && templateData.template) {
      const t = templateData.template;
      setName(t.name || '');
      if (t.type) setTemplateType(t.type);
      if (t.state) setTemplateState(t.state);
      if (t.defaultLanguage) setLanguage(t.defaultLanguage);
      if (t.trigger?.eventKey) {
        setTrigger(t.trigger.eventKey);
      }

      // Check draftVersion first, then currentVersion
      const version = templateData.draftVersion || templateData.currentVersion;
      if (version) {
        if (version.major !== undefined && version.minor !== undefined) {
          setVersionLabel(`${version.major}.${version.minor}`);
        }
        const langContent =
          version.languages?.find((l: any) => l.language === (t.defaultLanguage || 'en-IN')) ||
          version.languages?.[0];

        if (langContent) {
          if (langContent.language) setLanguage(langContent.language);
          if (langContent.email) {
            setEmailEnabled(langContent.email.enabled ?? true);
            if (langContent.email.subject) setEmailSubject(langContent.email.subject);
            if (langContent.email.ctaLabel) setCtaLabel(langContent.email.ctaLabel);
            if (langContent.email.ctaUrl) setCtaUrl(langContent.email.ctaUrl);
            if (langContent.email.bodyHtml) {
              try {
                if (langContent.email.bodyHtml.startsWith('[') || langContent.email.bodyHtml.startsWith('{')) {
                  setEmailEditorValue(JSON.parse(langContent.email.bodyHtml));
                } else {
                  setEmailEditorValue([
                    {
                      type: 'paragraph',
                      children: [{ text: langContent.email.bodyText || langContent.email.bodyHtml }],
                    },
                  ]);
                }
              } catch {
                setEmailEditorValue([
                  {
                    type: 'paragraph',
                    children: [{ text: langContent.email.bodyText || langContent.email.bodyHtml }],
                  },
                ]);
              }
            }
          }
          if (langContent.sms) {
            setSmsEnabled(langContent.sms.enabled ?? false);
            if (langContent.sms.body) setSmsBody(langContent.sms.body);
            if (langContent.sms.dltTemplateId) setDltTemplateId(langContent.sms.dltTemplateId);
          }
          if (langContent.whatsapp) {
            setWhatsappEnabled(langContent.whatsapp.enabled ?? false);
            if (langContent.whatsapp.body) setWhatsappBody(langContent.whatsapp.body);
            if (langContent.whatsapp.ctaLabel) setWhatsappCtaLabel(langContent.whatsapp.ctaLabel);
            if (langContent.whatsapp.ctaUrl) setWhatsappCtaUrl(langContent.whatsapp.ctaUrl);
          }
        }
      } else if (t.description) {
        // Fallback: check if previous description had JSON
        try {
          if (t.description.startsWith('[') || t.description.startsWith('{')) {
            setEmailEditorValue(JSON.parse(t.description));
          }
        } catch {
          // ignore
        }
      }
      setIsLoaded(true);
    }
  }, [templateData]);

  useEffect(() => {
    // Generate simple text preview
    const text = emailEditorValue
      .map((node: any) => node.children?.map((c: any) => c.text).join('') || '')
      .join('\n');
    setPreviewText(text || 'Hi Aisha,\n\nYour enrollment is confirmed.');
  }, [emailEditorValue]);

  const handleToggleCurrentChannel = (checked: boolean) => {
    if (currentChannel === 'Email') setEmailEnabled(checked);
    if (currentChannel === 'SMS') setSmsEnabled(checked);
    if (currentChannel === 'WhatsApp') setWhatsappEnabled(checked);
  };

  const isCurrentChannelEnabled =
    currentChannel === 'Email' ? emailEnabled : currentChannel === 'SMS' ? smsEnabled : whatsappEnabled;

  const handleInsertToken = (token: string) => {
    if (currentChannel === 'Email') {
      setEmailSubject((prev) => `${prev} ${token}`);
    } else if (currentChannel === 'SMS') {
      setSmsBody((prev) => `${prev} ${token}`);
    } else {
      setWhatsappBody((prev) => `${prev} ${token}`);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const emailBodyText = emailEditorValue
        .map((node: any) => node.children?.map((c: any) => c.text).join('') || '')
        .join('\n');
      const emailBodyHtml = JSON.stringify(emailEditorValue);

      const languagesPayload: any[] = [
        {
          language,
          isDefault: true,
          email: {
            enabled: emailEnabled,
            subject: emailSubject,
            bodyHtml: emailBodyHtml,
            bodyText: emailBodyText,
            ctaLabel,
            ctaUrl,
          },
          sms: {
            enabled: smsEnabled,
            body: smsBody,
            dltTemplateId: dltTemplateId || undefined,
          },
          whatsapp: {
            enabled: whatsappEnabled,
            body: whatsappBody,
            ctaLabel: whatsappCtaLabel || ctaLabel,
            ctaUrl: whatsappCtaUrl || ctaUrl,
          },
        },
      ];

      const enabledChannelsList: string[] = [];
      if (emailEnabled) enabledChannelsList.push('EMAIL');
      if (smsEnabled) enabledChannelsList.push('SMS');
      if (whatsappEnabled) enabledChannelsList.push('WHATSAPP');

      const payload: any = {
        name,
        description: emailBodyText.slice(0, 450) || name,
        trigger: {
          type: 'EVENT',
          eventKey: trigger,
        },
        isTransactional: false,
        defaultLanguage: language,
        state: templateState,
        enabledChannels: enabledChannelsList,
        languages: languagesPayload,
      };

      if (isNew) {
        await createTemplate(payload);
      } else {
        await updateTemplate(payload);
      }
      navigate('/partner/notifications');
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#f7f9fa] text-[#202a33] min-h-screen flex">
      <style>{`
    * {
      box-sizing: border-box;
    }

    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .field {
      width: 100%;
      border: 1px solid #dfe5e9;
      border-radius: 7px;
      background: #fff;
      padding: 9px 10px;
      color: #25313b;
      font-size: 12px;
      outline: none;
    }

    .field:focus {
      border-color: #0b7184;
      box-shadow: 0 0 0 3px #0b71841a;
    }

    .label {
      display: block;
      color: #596570;
      font-size: 10px;
      font-weight: 650;
      margin-bottom: 5px;
    }

    .panel {
      background: #fff;
      border: 1px solid #e5e9ec;
      border-radius: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid #e0e5e8;
      border-radius: 7px;
      padding: 8px 11px;
      font-size: 11px;
      font-weight: 650;
      white-space: nowrap;
      transition: .15s;
      cursor: pointer;
    }

    .btn:hover {
      filter: brightness(.97);
    }

    .btn-primary {
      color: white;
      background: #08677a;
      border-color: #08677a;
    }

    .btn-danger {
      color: #dc4655;
      background: #fff4f5;
      border-color: #ffe0e3;
    }

    .muted {
      color: #7b8791;
    }

    .tiny-pill {
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 9px;
      font-weight: 750;
      letter-spacing: .02em;
    }

    .channel-tab {
      flex: 1;
      border: 1px solid #edf0f2;
      border-radius: 7px;
      padding: 8px 5px;
      color: #52606b;
      font-size: 11px;
      font-weight: 650;
      cursor: pointer;
    }

    .channel-tab.active {
      color: #096b7e;
      background: #f0fafb;
      border-color: #b9e0e6;
    }

    .token {
      display: inline-flex;
      align-items: center;
      background: #edf7f9;
      color: #2d8190;
      border-radius: 5px;
      padding: 4px 7px;
      font-size: 9px;
      font-weight: 650;
      cursor: pointer;
      border: none;
    }

    .token:hover {
      background: #d9eff3;
    }

    @media (max-width: 1023px) {
      .main-grid {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      .preview-column {
        order: -1;
      }
    }
  `}</style>
      <div className="flex-1 min-w-0">
        <main className="max-w-[1500px] mx-auto p-4 md:p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-[11px] text-gray-400 mb-1">
                Communication <span className="mx-1">/</span> Notification templates
              </div>
              <h1 className="text-[24px] md:text-[27px] font-bold tracking-[-.04em]">
                {isNew ? 'Create Notification Template' : 'Edit Notification Template'}
              </h1>
              <p className="text-[11px] text-gray-500 mt-1">
                Manage reusable system and custom messages with safe fallbacks and versioning.
              </p>
            </div>
            <button
              className="btn btn-primary mt-5"
              id="saveTop"
              onClick={handleSave}
              disabled={isSaving || isCreating || isUpdating}
            >
              ＋ <span>{isSaving || isCreating || isUpdating ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>

          <section className="panel p-4 mb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-[230px] flex-1">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="tiny-pill bg-blue-50 text-blue-600">{templateType} TEMPLATE</span>
                  <span
                    id="enabledBadge"
                    className={`tiny-pill ${
                      templateState === 'ENABLED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    ● {templateState === 'ENABLED' ? 'ENABLED' : templateState}
                  </span>
                  <span className="tiny-pill bg-sky-50 text-sky-700">VERSION {versionLabel}</span>
                </div>
                <input
                  id="templateTitle"
                  className="font-bold text-[16px] bg-transparent border-b border-dashed border-gray-300 focus:border-brand-600 focus:outline-none placeholder-gray-400 w-full mb-2 pb-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Template Title"
                />
                <div className="mt-2 flex gap-2 items-start text-[10px] text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-base">
                    ϟ
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">EVENT TRIGGER</div>
                    <select
                      className="text-gray-700 font-semibold bg-transparent focus:outline-none -ml-1 cursor-pointer"
                      value={trigger}
                      onChange={(e) => setTrigger(e.target.value)}
                    >
                      <option value="enrollment_confirmed">Enrollment status changes to Confirmed</option>
                      <option value="user_login">User Login</option>
                      <option value="payment_completed">Payment completed</option>
                    </select>
                    <div>Send once per learner and course · Cancel if enrollment is reversed within 60 seconds</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-primary"
                  id="saveBtn"
                  onClick={handleSave}
                  disabled={isSaving || isCreating || isUpdating}
                >
                  ▣ {isSaving || isCreating || isUpdating ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </section>

          <div className="main-grid grid grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
            <div className="space-y-4 min-w-0">
              {/* Language & version Section */}
              <section className="panel p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[15px]">Language &amp; version</h3>
                    <p className="text-[10px] text-gray-500">Published versions are immutable</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <label>
                    <span className="label">Language</span>
                    <select
                      id="language"
                      className="field"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en-IN">English (en-IN)</option>
                      <option value="hi-IN">Hindi (hi-IN)</option>
                      <option value="ta-IN">Tamil (ta-IN)</option>
                      <option value="te-IN">Telugu (te-IN)</option>
                    </select>
                  </label>
                  <label>
                    <span className="label">Version</span>
                    <select
                      className="field"
                      value={versionLabel}
                      onChange={(e) => setVersionLabel(e.target.value)}
                    >
                      <option value={versionLabel}>{versionLabel} · Current</option>
                    </select>
                  </label>
                  <label>
                    <span className="label">State</span>
                    <select
                      className="field"
                      value={templateState}
                      onChange={(e) => setTemplateState(e.target.value)}
                    >
                      <option value="ENABLED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 rounded-lg bg-[#f4f8fa] p-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-600">
                  <span>⚑ &nbsp; If a learner language variant is unavailable, use English (en-IN).</span>
                </div>
              </section>

              {/* Channel variants Section */}
              <section className="panel p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-[15px]">Channel variants</h3>
                  <p className="text-[10px] text-gray-500">Each enabled channel validates independently</p>
                </div>
                <div className="flex gap-1 mb-3">
                  <button
                    className={`channel-tab ${currentChannel === 'Email' ? 'active' : ''}`}
                    onClick={() => setCurrentChannel('Email')}
                  >
                    ✉ &nbsp; Email
                  </button>
                  <button
                    className={`channel-tab ${currentChannel === 'SMS' ? 'active' : ''}`}
                    onClick={() => setCurrentChannel('SMS')}
                  >
                    ▤ &nbsp; SMS
                  </button>
                  <button
                    className={`channel-tab ${currentChannel === 'WhatsApp' ? 'active' : ''}`}
                    onClick={() => setCurrentChannel('WhatsApp')}
                  >
                    ◉ &nbsp; WhatsApp
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    id="channelEnabledBadge"
                    className={`tiny-pill ${
                      isCurrentChannelEnabled
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCurrentChannelEnabled ? '● ENABLED' : '○ DISABLED'}
                  </span>
                  <span className="tiny-pill bg-green-50 text-green-700">✓ VALID</span>
                  <span className="text-[10px] text-gray-500" id="providerLabel">
                    Provider:{' '}
                    {currentChannel === 'Email'
                      ? 'Akadly SendGrid'
                      : currentChannel === 'SMS'
                      ? 'Akadly Twilio'
                      : 'Meta Cloud API'}
                  </span>
                  <label className="flex items-center gap-2 sm:ml-auto text-[10px] font-semibold cursor-pointer">
                    <input
                      id="enableChannel"
                      type="checkbox"
                      checked={isCurrentChannelEnabled}
                      onChange={(e) => handleToggleCurrentChannel(e.target.checked)}
                      className="accent-[#08758a] w-4 h-4 cursor-pointer"
                    />{' '}
                    Enable {currentChannel.toLowerCase()} variant
                  </label>
                </div>

                {/* Email specific controls */}
                {currentChannel === 'Email' && (
                  <>
                    <div id="subjectWrap" className="mb-2">
                      <label>
                        <span className="label">Subject</span>
                        <input
                          id="subject"
                          className="field"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Email Subject"
                        />
                      </label>
                    </div>
                    <div className="border border-slate-200 overflow-hidden rounded-lg">
                      {isLoaded && (
                        <RichTextEditor
                          key="email-editor"
                          initialValue={emailEditorValue}
                          className="min-h-[160px] text-[11px] bg-white"
                          placeholder="Message content..."
                          onChange={(val) => setEmailEditorValue(val)}
                        />
                      )}
                    </div>
                    <div id="ctaWrap" className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label>
                        <span className="label">CTA label</span>
                        <select
                          id="ctaLabel"
                          className="field"
                          value={ctaLabel}
                          onChange={(e) => setCtaLabel(e.target.value)}
                        >
                          <option value="Open my course">Open my course</option>
                          <option value="View enrollment">View enrollment</option>
                          <option value="Start learning">Start learning</option>
                          <option value="Complete profile">Complete profile</option>
                        </select>
                      </label>
                      <label>
                        <span className="label">CTA URL</span>
                        <select
                          className="field"
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                        >
                          <option value="{{course_portal_url}}">{"{{course_portal_url}}"}</option>
                          <option value="{{learner_dashboard_url}}">{"{{learner_dashboard_url}}"}</option>
                          <option value="{{support_url}}">{"{{support_url}}"}</option>
                        </select>
                      </label>
                    </div>
                  </>
                )}

                {/* SMS specific controls */}
                {currentChannel === 'SMS' && (
                  <div className="space-y-3">
                    <label>
                      <span className="label">SMS Message Body</span>
                      <textarea
                        id="smsBody"
                        className="field min-h-[140px] text-[11px]"
                        value={smsBody}
                        onChange={(e) => setSmsBody(e.target.value)}
                        placeholder="Hi {{learner_first_name}}, your enrollment in {{course_name}} is confirmed."
                      />
                    </label>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>{smsBody.length} characters</span>
                      <span>{Math.ceil((smsBody.length || 1) / 160)} SMS segment(s)</span>
                    </div>
                    <label>
                      <span className="label">DLT Template ID (Required for Indian SMS)</span>
                      <input
                        id="dltTemplateId"
                        className="field"
                        value={dltTemplateId}
                        onChange={(e) => setDltTemplateId(e.target.value)}
                        placeholder="e.g. 1107161234567890123"
                      />
                    </label>
                    <div
                      id="smsHint"
                      className="text-[10px] text-amber-700 bg-amber-50 p-3 rounded-lg"
                    >
                      SMS content should be concise. Long messages may be split into multiple segments.
                    </div>
                  </div>
                )}

                {/* WhatsApp specific controls */}
                {currentChannel === 'WhatsApp' && (
                  <div className="space-y-3">
                    <label>
                      <span className="label">WhatsApp Message Body</span>
                      <textarea
                        id="whatsappBody"
                        className="field min-h-[140px] text-[11px]"
                        value={whatsappBody}
                        onChange={(e) => setWhatsappBody(e.target.value)}
                        placeholder="Hello {{learner_first_name}}! Welcome to {{course_name}}."
                      />
                    </label>
                    <div id="ctaWrapWhatsapp" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label>
                        <span className="label">CTA Button Label</span>
                        <input
                          className="field"
                          value={whatsappCtaLabel}
                          onChange={(e) => setWhatsappCtaLabel(e.target.value)}
                          placeholder="Open my course"
                        />
                      </label>
                      <label>
                        <span className="label">CTA Button URL</span>
                        <input
                          className="field"
                          value={whatsappCtaUrl}
                          onChange={(e) => setWhatsappCtaUrl(e.target.value)}
                          placeholder="{{course_portal_url}}"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </section>

              {/* Variables & fallback logic Section */}
              <section className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[15px]">Variables &amp; fallback logic</h3>
                    <p className="text-[10px] text-gray-500">Required variables must resolve before delivery</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 mb-3" id="variableTokens">
                  {[
                    '{{learner_first_name}}',
                    '{{course_name}}',
                    '{{batch_name}}',
                    '{{start_date}}',
                    '{{course_portal_url}}',
                    '{{support_email}}',
                  ].map((token) => (
                    <button
                      key={token}
                      type="button"
                      className={`token ${token.includes('url') ? '!bg-orange-50 !text-orange-600' : ''}`}
                      onClick={() => handleInsertToken(token)}
                      title={`Click to append ${token}`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="grid grid-cols-[minmax(120px,1fr)_24px_minmax(120px,2fr)] gap-2 bg-[#f6f9fa] rounded-md px-2.5 py-2">
                    <code className="text-brand-700">learner_first_name</code>
                    <span>→</span>
                    <span>Use “there” when missing</span>
                  </div>
                  <div className="grid grid-cols-[minmax(120px,1fr)_24px_minmax(120px,2fr)] gap-2 bg-[#f6f9fa] rounded-md px-2.5 py-2">
                    <code className="text-brand-700">batch_name</code>
                    <span>→</span>
                    <span>Use “your upcoming batch”</span>
                  </div>
                  <div className="grid grid-cols-[minmax(120px,1fr)_24px_minmax(120px,2fr)] gap-2 bg-[#f6f9fa] rounded-md px-2.5 py-2">
                    <code className="text-brand-700">start_date</code>
                    <span>→</span>
                    <span>Suppress sentence if unavailable</span>
                  </div>
                  <div className="grid grid-cols-[minmax(120px,1fr)_24px_minmax(120px,2fr)] gap-2 bg-[#f6f9fa] rounded-md px-2.5 py-2">
                    <code className="text-brand-700">support_email</code>
                    <span>→</span>
                    <span>Use help@akadly.com</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right preview & meta column */}
            <aside className="preview-column space-y-4 min-w-0">
              <section className="panel p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[14px]">Preview ({currentChannel})</h3>
                  <span className="tiny-pill bg-brand-700 text-white">AISHA KHAN</span>
                </div>
                <div className="rounded-lg bg-[#f5f7f8] p-2.5 mb-2">
                  <div className="text-[8px] uppercase tracking-wide font-bold text-gray-500">
                    REALISTIC LEARNER DATA
                  </div>
                  <div className="text-[9px] text-gray-600 mt-1">
                    Aisha Khan · DA-2026-A · Data Analytics Professional Certificate · starts 06 Oct 2026
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="text-[9px] text-gray-500 mb-1">From: Northstar Academy</div>
                  <div id="previewSubject" className="font-bold text-[11px] leading-snug">
                    {currentChannel === 'Email' ? emailSubject || name : `${currentChannel} Message`}
                  </div>
                  <div className="border-t border-gray-100 my-3"></div>
                  <div id="previewBody" className="text-[10px] leading-[1.8] whitespace-pre-line">
                    {currentChannel === 'Email'
                      ? previewText
                      : currentChannel === 'SMS'
                      ? smsBody || 'Hi Aisha,\n\nYour enrollment is confirmed.'
                      : whatsappBody || 'Hi Aisha,\n\nYour enrollment is confirmed.'}
                  </div>
                  {(currentChannel === 'Email' || currentChannel === 'WhatsApp') && (
                    <button id="previewCta" className="btn btn-primary w-full mt-3 !text-[10px]">
                      {currentChannel === 'Email' ? ctaLabel : whatsappCtaLabel || ctaLabel}
                    </button>
                  )}
                </div>
                <div className="flex gap-1 mt-3 bg-[#f4f7f8] rounded-lg p-1">
                  <button
                    className="flex-1 rounded-md bg-white shadow-sm py-2 text-[10px] font-semibold"
                    id="desktopBtn"
                  >
                    Desktop
                  </button>
                  <button
                    className="flex-1 rounded-md py-2 text-[10px] font-semibold text-gray-500"
                    id="mobileBtn"
                  >
                    Mobile
                  </button>
                </div>
              </section>

              <section className="panel p-3">
                <h3 className="font-bold text-[14px]">Test delivery</h3>
                <p className="text-[10px] text-gray-500 mt-1 mb-3">Test recipient</p>
                <label className="block mb-2">
                  <select className="field" id="recipient">
                    <option>maya@northstar.edu</option>
                    <option>aisha.khan@northstar.edu</option>
                    <option>qa@northstar.edu</option>
                  </select>
                </label>
                <label className="block mb-3">
                  <select className="field" id="learner">
                    <option>Aisha Khan · DA-2026-A</option>
                    <option>Maya Sharma · DA-2026-B</option>
                    <option>Rahul Das · DA-2026-A</option>
                  </select>
                </label>
                <button className="btn w-full" id="sendTest">
                  ➤ &nbsp; Send test <span id="testChannel">{currentChannel.toLowerCase()}</span>
                </button>
                <p id="lastDelivered" className="text-center text-[9px] text-emerald-700 mt-2">
                  Last test delivered · Today, 10:42
                </p>
              </section>

              <section className="panel p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[14px]">Change history</h3>
                  <button className="text-[9px] text-brand-700 font-semibold" id="compareVersions">
                    Compare versions
                  </button>
                </div>
                <div className="border-l-2 border-brand-700 pl-3 space-y-3 text-[10px]">
                  {historyData?.items?.length ? (
                    historyData.items.map((item: any, i: number) => (
                      <div key={i}>
                        <div className="font-bold">{item.action || 'Updated template'}</div>
                        <div className="text-gray-500">
                          {item.actorName || 'System'} ·{' '}
                          {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div className="font-bold">Template created</div>
                      <div className="text-gray-500">System · Just now</div>
                    </div>
                  )}
                </div>
              </section>

              <section className="panel p-3">
                <div className="flex gap-2 items-start text-[10px] text-gray-600">
                  <span className="text-blue-500 text-base">♢</span>
                  <p>
                    Disabling this system template affects future enrollment events only. A confirmation and reason
                    are required.
                  </p>
                </div>
                <button className="btn btn-danger w-full mt-3" id="disableBottom">
                  ⏻ Disable template...
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
