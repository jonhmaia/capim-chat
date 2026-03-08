"use client";

import React, { useEffect, useState } from 'react';

type MermaidDiagramProps = {
  chart: string;
  className?: string;
};

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className }) => {
  const [svg, setSvg] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'default'
        });
        const chartId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const { svg: renderedSvg } = await mermaid.render(chartId, chart);

        if (isMounted) {
          setSvg(renderedSvg);
          setHasError(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
          setSvg('');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (hasError) {
    return (
      <pre className={className}>
        {chart}
      </pre>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
