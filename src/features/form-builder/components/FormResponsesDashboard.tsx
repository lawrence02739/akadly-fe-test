import React, { useState } from 'react';
import { Download, Users, Clock, CheckCircle, Link } from 'lucide-react';

export const FormResponsesDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'SUMMARY' | 'INDIVIDUAL'>('SUMMARY');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Mock data for the dashboard
  const responseCount = 42;
  const averageTime = '4m 32s';

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center py-8">
      <div className="w-[770px] max-w-[90%] flex flex-col gap-6">
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-normal text-slate-800">{responseCount} Responses</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Total Submissions</span>
            </div>
            <span className="text-2xl font-semibold text-slate-800">{responseCount}</span>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Avg. Time to Complete</span>
            </div>
            <span className="text-2xl font-semibold text-slate-800">{averageTime}</span>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <span className="text-2xl font-semibold text-slate-800">87%</span>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-md">
              <Link className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Connect Webhook</span>
              <span className="text-xs text-slate-500">Send form responses automatically to your server.</span>
            </div>
          </div>
          <div className="flex-1 max-w-md flex items-center gap-2">
            <input 
              type="url" 
              placeholder="https://your-server.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded p-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
            />
            <button className="px-4 py-2 bg-slate-800 text-white rounded text-sm font-medium hover:bg-slate-700 transition-colors shrink-0">
              Save
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200">
          <button 
            onClick={() => setActiveSubTab('SUMMARY')}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'SUMMARY' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Summary
          </button>
          <button 
            onClick={() => setActiveSubTab('INDIVIDUAL')}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'INDIVIDUAL' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Individual Responses
          </button>
        </div>

        {activeSubTab === 'SUMMARY' ? (
          <div className="flex flex-col gap-6">
            {/* Individual question summaries (Mocked) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-800">Question Summary</h3>
              </div>
          <div className="p-6 flex flex-col gap-8">
            {/* Mock Chart 1 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-medium text-slate-800">How did you hear about us?</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="w-32 text-sm text-slate-600">Social Media</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-sm overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '45%' }} />
                  </div>
                  <span className="w-12 text-sm text-slate-500 text-right">45%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-32 text-sm text-slate-600">Friend</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-sm overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '30%' }} />
                  </div>
                  <span className="w-12 text-sm text-slate-500 text-right">30%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-32 text-sm text-slate-600">Search Engine</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-sm overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '25%' }} />
                  </div>
                  <span className="w-12 text-sm text-slate-500 text-right">25%</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Mock Chart 2 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-medium text-slate-800">Any additional feedback?</h4>
              <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-3">
                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600">"The event was organized perfectly!"</div>
                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600">"Would love to see more networking opportunities."</div>
                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600">"Great experience overall."</div>
              </div>
            </div>
          </div>
        </div>
      </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center py-12 text-slate-500 gap-4">
            <Users className="w-12 h-12 text-slate-300" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-800 mb-1">Individual Responses</h3>
              <p className="text-sm">View full responses from individuals here.</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50" disabled>&lt; Previous</button>
              <span className="text-sm">1 of {responseCount}</span>
              <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">Next &gt;</button>
            </div>
            <div className="w-full mt-6 bg-slate-50 rounded-lg border border-slate-200 p-6">
              {/* Mock individual response */}
              <div className="flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-800">How did you hear about us?</span>
                  <span className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-200">Social Media</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-800">Any additional feedback?</span>
                  <span className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-200">"The event was organized perfectly!"</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
