import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import * as echarts from 'echarts';

function MarkdownRenderer({ content, autoParseMedia = true }) {
  // 自定义代码块渲染器
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    if (!inline && className) {
      const match = /language-(\w+)/.exec(className);
      if (match && match[1] === 'json-chart' && autoParseMedia) {
        // 处理 JSON 图表
        try {
          const chartData = JSON.parse(children);
          return (
            <div className="mt-4 mb-6">
              <div 
                ref={(el) => {
                  if (el) {
                    const chart = echarts.init(el);
                    chart.setOption(chartData);
                    
                    // 响应式调整
                    window.addEventListener('resize', () => {
                      chart.resize();
                    });
                  }
                }}
                style={{ height: '400px', width: '100%' }}
              />
            </div>
          );
        } catch (error) {
          return (
            <pre className={className} {...props}>
              <code>{children}</code>
            </pre>
          );
        }
      }
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  // 自定义图片渲染器
  const Image = ({ node, alt, src, title }) => {
    if (autoParseMedia) {
      return (
        <div className="my-4">
          <img 
            src={src} 
            alt={alt} 
            title={title}
            className="max-w-full h-auto max-h-[200px] object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              // 简单的图片预览功能
              const imgWindow = window.open('', '_blank');
              if (imgWindow) {
                imgWindow.document.write(`
                  <html>
                    <body style="margin: 0; padding: 20px; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                      <img src="${src}" alt="${alt}" style="max-width: 90%; max-height: 90vh; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
                    </body>
                  </html>
                `);
                imgWindow.document.close();
              }
            }}
          />
          {alt && (
            <p className="text-center text-sm text-gray-500 mt-2">{alt}</p>
          )}
        </div>
      );
    }
    return (
      <img src={src} alt={alt} title={title} className="max-w-full h-auto" />
    );
  };

  // 自定义链接渲染器
  const Link = ({ node, href, children, title }) => {
    return (
      <a 
        href={href} 
        title={title}
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        {children}
      </a>
    );
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code: CodeBlock,
        img: Image,
        a: Link,
        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
        p: ({ children }) => <p className="my-2">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
        li: ({ children }) => <li className="my-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">
            {children}
          </blockquote>
        ),
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        br: () => <br />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;