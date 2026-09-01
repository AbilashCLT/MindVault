import React, { useState } from 'react';
import {
  Mail,
  ExternalLink,
  Copy,
  Check,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  Code,
} from 'lucide-react';

export interface EmailDispatchData {
  recipient: string;
  subject: string;
  plainText?: string;
  previewHtml?: string;
  gmailComposeUrl?: string;
  mailtoUrl?: string;
  deliveryId?: string;
}

interface EmailDispatchModalProps {
  data: EmailDispatchData;
  onClose: () => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  data,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'text' | 'html'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGmail = () => {
    if (data.gmailComposeUrl) {
      window.open(data.gmailComposeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenMailto = () => {
    if (data.mailtoUrl) {
      window.location.href = data.mailtoUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#11131C] border border-white/[0.12] shadow-2xl overflow-hidden text-[#F3F4F6]">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161826]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD] shadow-md shadow-[#8B5CF6]/15">
              <Mail className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#F9FAFB]">Email Dispatcher & Delivery Hub</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-mono">
                  Synthesized
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Destination: <span className="text-[#C4B5FD] font-mono">{data.recipient}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Direct Actions Toolbar */}
        <div className="p-4 bg-[#141724] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenGmail}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/40 text-[#FFA494] text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Open pre-composed message in Gmail Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#FF7D66]" />
              <span>Open in Gmail</span>
            </button>

            <button
              onClick={handleOpenMailto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1B4B] hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-medium transition-all cursor-pointer"
              title="Open in your default desktop email client (Apple Mail, Outlook, etc.)"
            >
              <Send className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Open in Mail App</span>
            </button>
          </div>

          {/* Tab switchers */}
          <div className="flex items-center gap-1 bg-[#0B0D14] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#1E1B4B] text-[#C4B5FD] font-semibold'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Visual HTML</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-[#1E1B4B] text-[#C4B5FD] font-semibold'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Plain Text</span>
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'html'
                  ? 'bg-[#1E1B4B] text-[#C4B5FD] font-semibold'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Raw Code</span>
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#0B0D14] space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] text-[#9CA3AF]">
              Subject: <span className="font-semibold text-[#F9FAFB]">{data.subject}</span>
            </div>
            {data.deliveryId && (
              <div className="text-[10px] text-[#6B7280] font-mono">
                Telemetry Delivery ID: {data.deliveryId}
              </div>
            )}
          </div>

          {activeTab === 'preview' && (
            <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#11131C] p-2">
              <iframe
                title="Email Preview"
                srcDoc={data.previewHtml || '<p>No preview available</p>'}
                className="w-full h-[380px] rounded-lg border-0 bg-[#0B0D14]"
                sandbox="allow-same-origin"
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="relative rounded-xl border border-white/[0.08] bg-[#11131C] p-4">
              <pre className="text-xs text-[#D1D5DB] font-mono whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                {data.plainText || 'No text content'}
              </pre>
            </div>
          )}

          {activeTab === 'html' && (
            <div className="relative rounded-xl border border-white/[0.08] bg-[#11131C] p-4">
              <pre className="text-[11px] text-[#A78BFA] font-mono whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                {data.previewHtml || ''}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#161826] border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Zero-Trust Encrypted Notification Pipeline</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeTab === 'html' ? (data.previewHtml || '') : (data.plainText || ''))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1E2235] hover:bg-[#282E47] text-[#E5E7EB] text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Content'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
