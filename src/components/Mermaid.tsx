'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
        });
    }, []);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !ref.current) return;

            try {
                // Generate a unique ID for each render
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // Clear any previous error
                setError('');

                // Render the diagram
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError('Failed to render flow chart');
                // We don't display the raw error to the user as it acts as a fallback or just a message
            }
        };

        renderChart();
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 rounded bg-red-50 text-red-500 border border-red-100 text-sm">
                <p>Unable to render diagram</p>
                <pre className="mt-2 text-xs overflow-x-auto">{chart}</pre>
            </div>
        );
    }

    // While loading or if we have SVG, we render a div
    // We render the SVG string using dangerouslySetInnerHTML
    return (
        <div
            ref={ref}
            className="flex justify-center my-8 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
