import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileDown } from 'lucide-react';

interface DownloadDropdownProps {
    onDownloadTxt: () => void;
    onDownloadDocx: () => void;
    downloadText: string;
    downloadDocxText: string;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
    onDownloadTxt,
    onDownloadDocx,
    downloadText,
    downloadDocxText
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDownloadTxt = () => {
        onDownloadTxt();
        setIsOpen(false);
    };

    const handleDownloadDocx = () => {
        onDownloadDocx();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Main Download Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm min-h-[40px]"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Download className="h-4 w-4" />
                <span>Download as</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[200px]">
                    <button
                        onClick={handleDownloadTxt}
                        className="w-full px-4 py-4 md:py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700 min-h-[48px] md:min-h-auto"
                    >
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-gray-900">{downloadText}</span>
                            <span className="text-xs text-gray-500">Plain text format (.txt)</span>
                        </div>
                    </button>

                    <div className="border-t border-gray-100"></div>

                    <button
                        onClick={handleDownloadDocx}
                        className="w-full px-4 py-4 md:py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700 min-h-[48px] md:min-h-auto"
                    >
                        <FileDown className="h-4 w-4 text-indigo-500" />
                        <div className="flex flex-col">
                            <span className="text-gray-900">{downloadDocxText}</span>
                            <span className="text-xs text-gray-500">Microsoft Word format (.docx)</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DownloadDropdown;
