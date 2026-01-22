import React, { useState, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { CodeBlock } from './components/CodeBlock';
import { generateScraperScript } from './services/geminiService';
import { GeneratedResult, GenerationState } from './types';
import { Bot, FileText, AlertCircle, Loader2, Sparkles, Download, TerminalSquare, Layers, Zap, ShieldCheck, CloudLightning, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    setScreenshotFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearFile = () => {
    setScreenshotFile(null);
    setPreviewUrl(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile || !url) return;

    setGenerationState({ status: 'analyzing', message: '正在分析网页结构...' });

    try {
      const base64 = await fileToBase64(screenshotFile);
      
      setGenerationState({ status: 'generating', message: '正在编写 Google Colab 专用脚本...' });
      
      const generatedData = await generateScraperScript(base64, url, notes);
      
      setResult(generatedData);
      setGenerationState({ status: 'completed' });
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setGenerationState({ 
        status: 'error', 
        error: err.message || "发生意外错误。" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">DocuStitch AI</h1>
              <p className="text-xs text-slate-500 font-medium">云端文档转 PDF 助手</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            <CloudLightning size={14} className="text-amber-500" />
            无需本地 Python 环境
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        
        {/* Intro */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            不会写代码？<br />
            <span className="text-brand-600">在云端一键生成 PDF</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            不用担心环境配置。上传截图，AI 会为您生成一段特殊的代码。
            <br />
            您只需将代码复制到 <strong>Google Colab（免费云电脑）</strong> 中运行，即可自动下载合并好的 PDF。
          </p>
        </section>

        {/* Workflow Steps */}
        <section className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                <h3 className="font-bold text-lg mb-2">上传截图</h3>
                <p className="text-slate-500 text-sm">
                    告诉 AI 目标网站长什么样，以便它找到所有文档链接。
                </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">2</div>
                <h3 className="font-bold text-lg mb-2">获取云端代码</h3>
                <p className="text-slate-500 text-sm">
                    AI 会生成一段包含所有依赖安装命令的完整代码。
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">3</div>
                <h3 className="font-bold text-lg mb-2">粘贴并运行</h3>
                <p className="text-slate-500 text-sm">
                    打开我们提供的 Google Colab 链接，粘贴代码，点击播放。PDF 会自动下载。
                </p>
            </div>
        </section>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
            <Zap className="text-amber-500 w-4 h-4" />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">第一步：生成您的代码</span>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Left Column: Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    文档首页网址
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://docs.example.com/introduction"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                  />
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">
                    特殊需求（可选）
                  </label>
                  <textarea
                    rows={4}
                    placeholder="例如：请强制移除顶部导航栏，防止遮挡内容；请忽略侧边栏中的‘社区’链接..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all outline-none resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    如果发现生成的 PDF 有内容被遮挡，请在此处说明“移除悬浮元素”。
                  </p>
                </div>
              </div>

              {/* Right Column: Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  网页截图 (AI 视觉导航)
                </label>
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  onClear={handleClearFile} 
                  selectedFile={screenshotFile} 
                  previewUrl={previewUrl}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={!url || !screenshotFile || generationState.status === 'analyzing' || generationState.status === 'generating'}
                className={`
                  flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-0.5
                  ${(!url || !screenshotFile) ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30'}
                `}
              >
                {(generationState.status === 'analyzing' || generationState.status === 'generating') ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {generationState.message}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    生成云端运行代码
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {generationState.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 text-red-800">
             <AlertCircle className="flex-shrink-0" />
             <div>
               <h3 className="font-bold">生成失败</h3>
               <p>{generationState.error}</p>
             </div>
          </div>
        )}

        {/* Results Section */}
        {result && generationState.status === 'completed' && (
          <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden text-white">
               <div className="p-8 md:p-10 text-center">
                 <h2 className="text-3xl font-bold mb-4">代码已准备就绪！</h2>
                 <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                   我们已经为您编写好了完整的抓取程序，并且内置了所有环境安装命令。现在，您只需要去 Google Colab 运行它。
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a 
                      href="https://colab.research.google.com/#create=true" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                      <ExternalLink size={20} />
                      1. 打开 Google Colab (新建笔记本)
                    </a>
                 </div>
                 <p className="mt-4 text-sm text-indigo-200 opacity-80">
                   提示：打开后，将下方的代码粘贴进去，点击左侧的“播放”按钮即可。
                 </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="p-8">
                 {/* Analysis Summary */}
                 <div className="flex gap-4 items-start mb-6 text-slate-600 bg-slate-50 p-4 rounded-lg text-sm">
                    <Bot className="flex-shrink-0 text-brand-500" />
                    <p>{result.explanation}</p>
                 </div>

                 {/* The Script */}
                 <div>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                       <FileText className="text-brand-500" />
                       完整代码
                     </h4>
                     <span className="text-xs font-mono text-slate-400">Main.ipynb</span>
                   </div>
                   <CodeBlock code={result.script} language="python" filename="colab_script.py" />
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;