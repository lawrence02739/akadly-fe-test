import React from 'react';
import { FormBuilderHeader } from './FormBuilderHeader';
import { FormBuilderCanvas } from './FormBuilderCanvas';
import { FormElementsPanel } from './FormElementsPanel';
import { FormFieldPropertiesDrawer } from './FormFieldPropertiesDrawer';
import { FormSettingsPanel } from './FormSettingsPanel';
import { FormThemeDesigner } from './FormThemeDesigner';
import { FormPreviewLayout } from './FormPreviewLayout';
import { FormResponsesDashboard } from './FormResponsesDashboard';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const FormBuilderLayout: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { isSettingsOpen, isThemeOpen, isPreviewMode, theme, activeTab, activeBlockId, loadForm, resetForm } = useFormBuilderStore();
  const [isLoading, setIsLoading] = React.useState(!!formId);

  React.useEffect(() => {
    if (formId) {
      setIsLoading(true);
      loadForm(formId).finally(() => setIsLoading(false));
    } else {
      resetForm();
      setIsLoading(false);
    }
  }, [formId, loadForm, resetForm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[#f1f3f4]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading form...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden rounded-xl shadow-sm border border-slate-200 relative transition-colors duration-300"
      style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}
    >
      {/* Top Header */}
      <div className="shrink-0 z-10 shadow-sm relative">
        <FormBuilderHeader />
      </div>

      {isPreviewMode ? (
        <FormPreviewLayout />
      ) : activeTab === 'RESPONSES' ? (
        <FormResponsesDashboard />
      ) : (
        <div className="flex-1 overflow-hidden relative flex bg-[#f1f3f4]">
          {/* Left Toolbox Panel */}
          <FormElementsPanel />

          {/* Main Canvas Area */}
          <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex justify-center py-8 relative">
            <div className={`w-[770px] max-w-[90%] transition-all ${activeBlockId ? 'mr-[320px]' : ''}`}>
              <FormBuilderCanvas />
            </div>
          </div>

          {/* Right Properties Drawer */}
          {activeBlockId && (
            <div className="absolute right-0 top-0 bottom-0 shadow-xl z-20">
              <FormFieldPropertiesDrawer />
            </div>
          )}

          {/* Settings / Theme Panel (Overrides Properties Drawer) */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-0 bottom-0 shadow-xl z-30">
              <FormSettingsPanel />
            </div>
          )}
          {isThemeOpen && (
            <div className="absolute right-0 top-0 bottom-0 shadow-xl z-30">
              <FormThemeDesigner />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
