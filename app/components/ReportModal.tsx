import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ReportModal({
  report,
  onClose,
  isGenerating,
  isOpen
}: {
  report: string | null;
  onClose: () => void;
  isGenerating: boolean;
  isOpen: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 40px rgba(0, 255, 65, 0.1)',
        }}
      >
        <div
          className="panel-header"
          style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dot" />
            FINAL SECURITY REPORT
          </div>
          {report && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              [X] CLOSE
            </button>
          )}
        </div>

        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.6
          }}
        >
          {isGenerating ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--green)' }}>
              <div className="animate-pulse-green" style={{ marginBottom: 16, fontSize: "1.2rem" }}>
                Synthesizing intelligence...
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                Assemble final penetration testing report
              </p>
            </div>
          ) : (
            <div style={{ fontSize: "0.9rem" }}>
              <style dangerouslySetInnerHTML={{
                __html: `
                 div h1, div h2, div h3 { color: var(--green); margin-top: 1.5em; margin-bottom: 0.5em; }
                 div h1 { font-size: 1.8em; }
                 div h2 { font-size: 1.4em; }
                 div p { margin-bottom: 1em; color: #ccc; }
                 div ul, div ol { margin-left: 1.5em; margin-bottom: 1em; color: #ccc;}
                 div li { margin-bottom: 0.25em; }
                 div strong { color: #fff; }
                 div code { background: rgba(0,255,65,0.1); padding: 2px 4px; border-radius: 4px; color: var(--green); font-family: var(--font-mono); }
                 div pre { background: var(--bg); padding: 12px; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; border: 1px solid var(--border); }
                 div pre code { background: transparent; padding: 0; color: inherit; }
                 div table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                 div th, div td { border: 1px solid var(--border); padding: 8px; text-align: left; }
                 div th { background-color: rgba(0,255,65,0.1); color: var(--green); }
               `}} />
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report || ""}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
