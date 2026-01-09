import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import api from '../api/axios';
import { Wand2, Upload, Download, Copy, FileText, Sparkles, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AutoFix = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [correctedText, setCorrectedText] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [formattingInstructions, setFormattingInstructions] = useState('Font: Times New Roman, Size: 12');
    const [errorAnalysis, setErrorAnalysis] = useState(null);
    const [expandedErrors, setExpandedErrors] = useState({ spelling: false, grammar: false, formatting: false });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file type
            const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
            if (!validTypes.includes(selectedFile.type)) {
                toast.error('Please upload a TXT, PDF, or DOCX file');
                return;
            }
            setFile(selectedFile);
            setShowResults(false);
        }
    };

    const handleAutoFix = async () => {
        if (!file) {
            toast.error('Please upload a file first');
            return;
        }

        setProcessing(true);
        try {
            // Upload file to backend for text extraction and correction
            const formData = new FormData();
            formData.append('file', file);
            formData.append('formatting_instructions', formattingInstructions);

            // Call a new endpoint that handles file upload and auto-fix
            const response = await api.post('auto-fix-file/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setOriginalText(response.data.original_text);
            setCorrectedText(response.data.corrected_text);
            setErrorAnalysis(response.data.error_analysis || null);
            setShowResults(true);
            toast.success('Text corrected successfully!');

        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to correct text';
            toast.error(errorMsg);
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = async () => {
        try {
            // Call backend to generate formatted file
            const response = await api.post('download-corrected-file/', {
                submission_id: null,
                corrected_text: correctedText,
                formatting_instructions: formattingInstructions,
                original_filename: file?.name || 'document.txt'
            }, {
                responseType: 'blob'
            });

            // Get filename from header or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'corrected_file.txt';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Download file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${filename}!`);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(correctedText);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
                                <Wand2 size={36} className="text-primary-purple" />
                                Auto-Fix AI
                            </h1>
                            <p className="text-gray-400">Automatically correct spelling, grammar, and formatting errors</p>
                        </div>
                        <NotificationCenter />
                    </div>

                    {!showResults ? (
                        /* Upload Section */
                        <div className="glass-card rounded-2xl p-8 border border-white/10">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                                    <Upload size={40} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-200 mb-2">Upload Your Document</h2>
                                <p className="text-gray-400">Support for TXT, PDF, and DOCX files</p>
                            </div>

                            <div className="max-w-md mx-auto">
                                <label className="block">
                                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary-purple/50 transition-all cursor-pointer group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".txt,.pdf,.docx,.doc"
                                            onChange={handleFileChange}
                                        />
                                        <FileText size={48} className="mx-auto mb-4 text-gray-400 group-hover:text-primary-purple transition-colors" />
                                        <p className="text-gray-300 font-medium mb-2">
                                            {file ? file.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-sm text-gray-500">TXT, PDF, or DOCX (max 10MB)</p>
                                    </div>
                                </label>

                                {/* Formatting Instructions */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Formatting Instructions (Optional)
                                    </label>
                                    <textarea
                                        value={formattingInstructions}
                                        onChange={(e) => setFormattingInstructions(e.target.value)}
                                        placeholder="e.g., Font: Times New Roman, Size: 11, Double spaced, 1 inch margins, Title bold and centered, Page numbers in footer, Justified alignment"
                                        className="aiclassroom-input w-full h-24 resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Specify: font name, size, spacing, alignment, margins, headers/footers, page numbers, title formatting, table formatting, etc.
                                    </p>
                                </div>

                                <button
                                    onClick={handleAutoFix}
                                    disabled={!file || processing}
                                    className="w-full mt-6 btn-modern py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={24} />
                                            Fix with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Results Section */
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
                                    <CheckCircle className="text-green-400" size={28} />
                                    Correction Complete!
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowResults(false);
                                        setFile(null);
                                        setOriginalText('');
                                        setCorrectedText('');
                                        setErrorAnalysis(null);
                                    }}
                                    className="glass-card px-4 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10"
                                >
                                    Upload New File
                                </button>
                            </div>

                            {/* Error Analysis Section */}
                            {errorAnalysis && (
                                <div className="glass-card rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="text-yellow-400" size={24} />
                                        <h3 className="text-xl font-bold text-gray-200">Detected Issues</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Spelling Errors */}
                                        <div className="glass-card p-4 rounded-lg border border-red-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-red-400 font-bold">{errorAnalysis.spelling_count || 0}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-300">Spelling Errors</span>
                                            </div>
                                            {errorAnalysis.spelling_errors && errorAnalysis.spelling_errors.length > 0 && (
                                                <>
                                                    <ul className="text-xs text-gray-400 space-y-1 mt-2 max-h-32 overflow-y-auto">
                                                        {(expandedErrors.spelling ? errorAnalysis.spelling_errors : errorAnalysis.spelling_errors.slice(0, 3)).map((error, idx) => (
                                                            <li key={idx} className="truncate">• {error}</li>
                                                        ))}
                                                    </ul>
                                                    {errorAnalysis.spelling_errors.length > 3 && (
                                                        <button
                                                            onClick={() => setExpandedErrors(prev => ({ ...prev, spelling: !prev.spelling }))}
                                                            className="text-xs text-red-400 hover:text-red-300 mt-2 underline"
                                                        >
                                                            {expandedErrors.spelling ? 'Show Less' : `+${errorAnalysis.spelling_errors.length - 3} more`}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Grammar Issues */}
                                        <div className="glass-card p-4 rounded-lg border border-orange-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-orange-400 font-bold">{errorAnalysis.grammar_count || 0}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-300">Grammar Issues</span>
                                            </div>
                                            {errorAnalysis.grammar_errors && errorAnalysis.grammar_errors.length > 0 && (
                                                <>
                                                    <ul className="text-xs text-gray-400 space-y-1 mt-2 max-h-32 overflow-y-auto">
                                                        {(expandedErrors.grammar ? errorAnalysis.grammar_errors : errorAnalysis.grammar_errors.slice(0, 3)).map((error, idx) => (
                                                            <li key={idx} className="truncate">• {error}</li>
                                                        ))}
                                                    </ul>
                                                    {errorAnalysis.grammar_errors.length > 3 && (
                                                        <button
                                                            onClick={() => setExpandedErrors(prev => ({ ...prev, grammar: !prev.grammar }))}
                                                            className="text-xs text-orange-400 hover:text-orange-300 mt-2 underline"
                                                        >
                                                            {expandedErrors.grammar ? 'Show Less' : `+${errorAnalysis.grammar_errors.length - 3} more`}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Formatting Issues */}
                                        <div className="glass-card p-4 rounded-lg border border-purple-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-400 font-bold">{errorAnalysis.formatting_count || 0}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-300">Formatting Issues</span>
                                            </div>
                                            {errorAnalysis.formatting_issues && errorAnalysis.formatting_issues.length > 0 && (
                                                <>
                                                    <ul className="text-xs text-gray-400 space-y-1 mt-2 max-h-32 overflow-y-auto">
                                                        {(expandedErrors.formatting ? errorAnalysis.formatting_issues : errorAnalysis.formatting_issues.slice(0, 3)).map((issue, idx) => (
                                                            <li key={idx} className="truncate">• {issue}</li>
                                                        ))}
                                                    </ul>
                                                    {errorAnalysis.formatting_issues.length > 3 && (
                                                        <button
                                                            onClick={() => setExpandedErrors(prev => ({ ...prev, formatting: !prev.formatting }))}
                                                            className="text-xs text-purple-400 hover:text-purple-300 mt-2 underline"
                                                        >
                                                            {expandedErrors.formatting ? 'Show Less' : `+${errorAnalysis.formatting_issues.length - 3} more`}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                {/* Original Text */}
                                <div className="glass-card rounded-xl p-6 border border-orange-500/30 bg-orange-500/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle className="text-orange-400" size={20} />
                                        <h3 className="font-bold text-gray-300">Original Text</h3>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                            {originalText}
                                        </pre>
                                    </div>
                                </div>

                                {/* Corrected Text */}
                                <div className="glass-card rounded-xl p-6 border border-green-500/30 bg-green-500/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="text-green-400" size={20} />
                                        <h3 className="font-bold text-gray-300">Corrected Text</h3>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                            {correctedText}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 justify-end">
                                <button
                                    onClick={handleCopy}
                                    className="glass-card px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10"
                                >
                                    <Copy size={18} />
                                    Copy Corrected Text
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="btn-modern px-6 py-3 rounded-xl flex items-center gap-2"
                                >
                                    <Download size={18} />
                                    Download Corrected File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AutoFix;
