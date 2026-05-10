import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
    ShieldCheck, Copy, Upload, Image as ImageIcon, 
    RefreshCw, Key, FileDigit, Link as LinkIcon, Unlink as UnlinkIcon, Check
} from 'lucide-react';

export default function App() {
    const [activeTab, setActiveTab] = useState<'password' | 'base64' | 'resizer'>('password');

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-mono flex flex-col items-center py-8 px-4 sm:px-6 md:py-12">
            <header className="w-full max-w-4xl flex flex-col items-center justify-center gap-4 mb-8 text-center">
                <div className="flex items-center justify-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-100">
                        Indiversa Kit
                    </h1>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 px-4 py-2 mt-2 rounded-lg flex items-center gap-2 text-sm md:text-base border-dashed shadow-sm shadow-emerald-900/20">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span><strong>100% Local:</strong> Your data never leaves your browser. No backend. No tracking.</span>
                </div>
            </header>

            <nav className="w-full max-w-4xl flex flex-wrap gap-2 mb-8 border-b border-zinc-800 pb-4">
                <TabButton active={activeTab === 'password'} onClick={() => setActiveTab('password')} icon={<Key className="w-4 h-4" />}>Password</TabButton>
                <TabButton active={activeTab === 'base64'} onClick={() => setActiveTab('base64')} icon={<FileDigit className="w-4 h-4" />}>Base64 Encoder</TabButton>
                <TabButton active={activeTab === 'resizer'} onClick={() => setActiveTab('resizer')} icon={<ImageIcon className="w-4 h-4" />}>Image Resizer</TabButton>
            </nav>

            <main className="w-full max-w-4xl bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-xl">
                {activeTab === 'password' && <PasswordGenerator />}
                {activeTab === 'base64' && <Base64Tool />}
                {activeTab === 'resizer' && <ImageResizer />}
            </main>
        </div>
    );
}

// --- Tab Button Component ---
function TabButton({ active, onClick, icon, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium
                ${active 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
        >
            {icon}
            {children}
        </button>
    );
}

// --- Password Generator utility ---
function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(32);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        let chars = '';
        if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (useNumbers) chars += '0123456789';
        if (useSymbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        if (chars.length === 0) {
            setPassword('Please select at least one character set.');
            return;
        }

        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        let pwd = '';
        for (let i = 0; i < length; i++) {
            pwd += chars[array[i] % chars.length];
        }
        setPassword(pwd);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        if (!password || password.startsWith('Please select')) return;
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // Generate on first mount and on settings change
    useEffect(() => {
        generatePassword();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length, useUpper, useLower, useNumbers, useSymbols]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Secure Password Generator</h2>
                <p className="text-sm text-zinc-500">Cryptographically secure generation using <code className="bg-zinc-800 px-1 py-0.5 rounded text-emerald-300 text-xs">window.crypto.getRandomValues()</code></p>
            </div>

            <div className="relative group">
                <div className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg p-4 font-mono text-lg sm:text-xl md:text-2xl break-all min-h-[4rem] flex items-center text-emerald-400 shadow-inner group-hover:border-zinc-500 transition-colors">
                    {password}
                </div>
                <button 
                    onClick={copyToClipboard}
                    className="absolute right-2 top-2 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors group-hover:opacity-100 opacity-80"
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <label className="font-semibold text-zinc-300 flex justify-between w-full">
                        <span>Length</span>
                        <span className="text-emerald-400">{length} characters</span>
                    </label>
                    <input 
                        type="range" 
                        min="8" max="128" 
                        value={length} 
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <Toggle label="Uppercase" checked={useUpper} onChange={setUseUpper} />
                    <Toggle label="Lowercase" checked={useLower} onChange={setUseLower} />
                    <Toggle label="Numbers" checked={useNumbers} onChange={setUseNumbers} />
                    <Toggle label="Symbols" checked={useSymbols} onChange={setUseSymbols} />
                </div>
            </div>

            <button 
                onClick={generatePassword}
                className="w-full sm:w-auto self-start flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
            >
                <RefreshCw className="w-5 h-5" />
                Generate New Password
            </button>
        </div>
    );
}

// Checkbox Toggle helper
function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-zinc-800/50 rounded transition-colors border border-transparent hover:border-zinc-700">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 bg-zinc-800 border-zinc-700 rounded"
            />
            <span className="text-sm select-none">{label}</span>
        </label>
    );
}

// --- Base64 Tool utility ---
function Base64Tool() {
    const [rawText, setRawText] = useState('');
    const [base64Text, setBase64Text] = useState('');
    const [fileBase64, setFileBase64] = useState('');
    const [copiedSecA, setCopiedSecA] = useState(false);
    const [copiedSecB, setCopiedSecB] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Safely encode unicode string to base64
    const encodeBase64 = (str: string) => window.btoa(unescape(encodeURIComponent(str)));
    // Safely decode base64 to unicode string
    const decodeBase64 = (str: string) => decodeURIComponent(escape(window.atob(str)));

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setRawText(val);
        try {
            setBase64Text(val ? encodeBase64(val) : '');
            setErrorMsg('');
        } catch (err) {
            setErrorMsg('Encoding error');
        }
    };

    const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setBase64Text(val);
        try {
            setRawText(val ? decodeBase64(val) : '');
            setErrorMsg('');
        } catch (err) {
            setErrorMsg('Invalid Base64 sequence');
        }
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setFileBase64(result);
        };
        reader.readAsDataURL(file);
    };

    const copyText = async (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed');
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-300">
            {/* Section A: Text Encode/Decode */}
            <section className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-100 mb-1">Text String Conversion</h2>
                    <p className="text-sm text-zinc-500">Live two-way encoding and decoding between raw text and Base64.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-semibold text-zinc-400">Raw Text</label>
                        <textarea 
                            value={rawText}
                            onChange={handleTextChange}
                            placeholder="Type raw text here..."
                            className="w-full h-40 bg-zinc-950 border border-zinc-700/50 rounded-lg p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none custom-scrollbar"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-semibold text-zinc-400">Base64 Encoded</label>
                            {errorMsg && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">{errorMsg}</span>}
                        </div>
                        <div className="relative h-40">
                            <textarea 
                                value={base64Text}
                                onChange={handleBase64Change}
                                placeholder="Type Base64 here..."
                                className={`w-full h-full bg-zinc-950 flex-col border ${errorMsg ? 'border-red-500/50' : 'border-zinc-700/50'} rounded-lg p-3 text-emerald-400 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none custom-scrollbar break-all`}
                            />
                            <button 
                                onClick={() => copyText(base64Text, setCopiedSecA)}
                                className="absolute right-2 top-2 p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                                title="Copy Base64 string"
                            >
                                {copiedSecA ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Section B: File to Base64 */}
            <section className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-100 mb-1">File to Base64</h2>
                    <p className="text-sm text-zinc-500">Extract Data URL containing the Base64 representation of any local file.</p>
                </div>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl cursor-pointer transition-colors group">
                    <Upload className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 mb-2 transition-colors" />
                    <span className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300">
                        Click to select a file
                    </span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>

                {fileBase64 && (
                    <div className="relative mt-2">
                        <textarea 
                            readOnly
                            value={fileBase64}
                            className="w-full h-32 bg-zinc-950 border border-zinc-700/50 rounded-lg p-3 text-emerald-500 resize-none focus:outline-none text-xs break-all custom-scrollbar"
                        />
                        <button 
                            onClick={() => copyText(fileBase64, setCopiedSecB)}
                            className="absolute right-3 top-3 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors shadow"
                            title="Copy File Base64"
                        >
                            {copiedSecB ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

// --- Image Resizer utility ---
function ImageResizer() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [filename, setFilename] = useState<string>('resized-image');
    const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
    const [targetSize, setTargetSize] = useState({ w: 0, h: 0 });
    const [lockAspect, setLockAspect] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(1);
    
    // Hidden canvas ref for processing
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Setup filename for download
        const namePart = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
        setFilename(`${namePart}-resized`);

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const w = img.width;
                const h = img.height;
                setOriginalSize({ w, h });
                setTargetSize({ w, h });
                setAspectRatio(w / h);
                setImageSrc(dataUrl);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
        const w = Math.max(1, parseInt(e.target.value) || 0);
        if (lockAspect) {
            setTargetSize({ w, h: Math.round(w / aspectRatio) });
        } else {
            setTargetSize(prev => ({ ...prev, w }));
        }
    };

    const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
        const h = Math.max(1, parseInt(e.target.value) || 0);
        if (lockAspect) {
            setTargetSize({ w: Math.round(h * aspectRatio), h });
        } else {
            setTargetSize(prev => ({ ...prev, h }));
        }
    };

    const downloadResized = () => {
        if (!imageSrc || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        canvas.width = targetSize.w;
        canvas.height = targetSize.h;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.onload = () => {
            // Processing physically in local RAM using Canvas API
            ctx.drawImage(img, 0, 0, targetSize.w, targetSize.h);
            const url = canvas.toDataURL('image/png');
            
            // Trigger automatic download
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = imageSrc;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Local Image Resizer</h2>
                <p className="text-sm text-zinc-500">Resize images directly within your browser's memory using HTML5 Canvas.</p>
            </div>

            <label className={`flex flex-col items-center justify-center w-full border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer transition-colors group ${imageSrc ? 'h-16 bg-zinc-950 border-zinc-800' : 'h-48 hover:border-emerald-500/50 hover:bg-emerald-500/5'}`}>
                {imageSrc ? (
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Upload className="w-4 h-4" /> 
                        <span className="text-sm">Change Image...</span>
                    </div>
                ) : (
                    <>
                        <ImageIcon className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 mb-2 transition-colors" />
                        <span className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300">Browse or drop an image</span>
                    </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            {imageSrc && (
                <div className="flex flex-col md:flex-row gap-8 bg-zinc-950 border border-zinc-800 p-4 sm:p-6 rounded-xl relative overflow-hidden">
                    {/* Visual Background Decoration */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    
                    <div className="flex-1 flex flex-col gap-2 relative z-10">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Preview</span>
                        <div className="w-full bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center overflow-hidden h-48 lg:h-64 checkered-bg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="text-xs text-zinc-500 text-center mt-1">
                            Original Size: {originalSize.w} x {originalSize.h}px
                        </div>
                    </div>

                    <div className="flex-[0.8] flex flex-col gap-6 relative z-10 justify-center">
                        <div className="flex flex-col gap-4">
                            <h3 className="font-semibold text-zinc-300">Dimensions</h3>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col flex-1">
                                    <label className="text-xs text-zinc-500 mb-1">Width (px)</label>
                                    <input 
                                        type="number" 
                                        value={targetSize.w} 
                                        onChange={handleWidthChange}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <button 
                                    onClick={() => setLockAspect(!lockAspect)}
                                    className={`mt-5 p-2 rounded transition-colors ${lockAspect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}
                                    title={lockAspect ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                                >
                                    {lockAspect ? <LinkIcon className="w-4 h-4" /> : <UnlinkIcon className="w-4 h-4" />}
                                </button>

                                <div className="flex flex-col flex-1">
                                    <label className="text-xs text-zinc-500 mb-1">Height (px)</label>
                                    <input 
                                        type="number" 
                                        value={targetSize.h} 
                                        onChange={handleHeightChange}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={downloadResized}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 mt-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Resized Image
                        </button>
                    </div>
                </div>
            )}
            
            {/* Hidden canvas for off-screen rendering */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

