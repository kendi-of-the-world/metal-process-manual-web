import React, { useState } from 'react';
import { useStorage, type WorkManual, type Tool } from '../contexts/StorageContext';
import { Colors, Spacing } from '../constants/theme';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ManualDetailScreenProps {
  manualId: string;
  onNavigate: (screen: 'home' | 'detail', manualId?: string) => void;
}

const ManualDetailScreen: React.FC<ManualDetailScreenProps> = ({ manualId, onNavigate }) => {
  const { getManual, updateManual } = useStorage();
  const manual = getManual(manualId);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState(manual || {
    id: '',
    customer: '',
    productName: '',
    productNumber: '',
    fileNo: '',
    machine: '',
    createdDate: '',
    createdBy: '',
    processName: '',
    processTime: '',
    prgM: '',
    prgS: '',
    material: '',
    materialSize: '',
    treatment: '',
    toolComment: '',
    subProgramNNumbers: '',
    tools: [],
    images: [],
  });
  const [tools, setTools] = useState<Tool[]>(manual?.tools || []);
  const [newTool, setNewTool] = useState({
    tNumber: '',
    hNumber: '',
    toolName: '',
    protrusion: '',
    bladeLength: '',
  });

  if (!manual) {
    return <div>作業手順書が見つかりません</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTool(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTool = () => {
    if (newTool.toolName) {
      setTools([...tools, { id: Date.now().toString(), ...newTool }]);
      setNewTool({ tNumber: '', hNumber: '', toolName: '', protrusion: '', bladeLength: '' });
    }
  };

  const handleRemoveTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  const handleSave = () => {
    const updatedManual: WorkManual = {
      ...formData,
      tools,
    };
    updateManual(manualId, updatedManual);
    setIsEditing(false);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 10;

      // タイトル
      pdf.setFontSize(14);
      pdf.text('第一製造部 セットアップシート', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // 基本情報テーブル
      autoTable(pdf, {
        startY: yPosition,
        head: [],
        body: [
          ['客先', manual.customer, 'ファイルNo', manual.fileNo, '加工機械', manual.machine],
          ['品名', manual.productName, 'CADデータ', '', '作成日', manual.createdDate],
          ['品番', manual.productNumber, '', '', '作成者', manual.createdBy],
        ],
        columnStyles: {
          0: { cellWidth: 20, fontStyle: 'bold' },
          1: { cellWidth: 30 },
          2: { cellWidth: 20, fontStyle: 'bold' },
          3: { cellWidth: 30 },
          4: { cellWidth: 20, fontStyle: 'bold' },
          5: { cellWidth: 30 },
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          yPosition = data.pageCount === 1 ? yPosition : 10;
        },
      });
      yPosition = (pdf as any).lastAutoTable.finalY + 5;

      // 工程・材質情報テーブル
      autoTable(pdf, {
        startY: yPosition,
        head: [],
        body: [
          ['工程', `工程(${manual.processTime}分)`, '', '', '材質', manual.material],
          ['PRG(M)', manual.prgM, '', '', '材寸', manual.materialSize],
          ['PRG(S)', manual.prgS, '', '', '処理', manual.treatment],
        ],
        columnStyles: {
          0: { cellWidth: 20, fontStyle: 'bold' },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20, fontStyle: 'bold' },
          5: { cellWidth: 30 },
        },
        margin: { left: 10, right: 10 },
      });
      yPosition = (pdf as any).lastAutoTable.finalY + 5;

      // 使用工具一覧テーブル
      const toolTableData = tools.map((tool, index) => [
        (index + 1).toString(),
        '',
        index === 0 ? manual.toolComment : '',
        tool.tNumber,
        tool.hNumber,
        tool.toolName,
        tool.protrusion,
        tool.bladeLength,
      ]);

      // 空行を追加して10行まで埋める
      while (toolTableData.length < 10) {
        toolTableData.push(['', '', '', '', '', '', '', '']);
      }

      autoTable(pdf, {
        startY: yPosition,
        head: [['N', 'TNo.', '工具コメント', 'T', 'H', '使用工具一覧', '突出', 'Z値']],
        body: toolTableData,
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 12, halign: 'center' },
          2: { cellWidth: 40 },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 12, halign: 'center' },
          5: { cellWidth: 40 },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 15, halign: 'center' },
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          // ページ番号を追加
          const pageSize = pdf.internal.pageSize;
          const pageCount = (pdf as any).internal.getNumberOfPages();
          pdf.setFontSize(10);
          pdf.text(`ページ ${data.pageNumber} / ${pageCount}`, pageSize.getWidth() / 2, pageSize.getHeight() - 10, { align: 'center' });
        },
      });

      // サブプログラムN番号を最後に追加
      if (manual.subProgramNNumbers) {
        yPosition = (pdf as any).lastAutoTable.finalY + 5;
        pdf.setFontSize(10);
        pdf.text('サブプログラムN番号:', 10, yPosition);
        yPosition += 5;
        const subProgramLines = manual.subProgramNNumbers.split('\n');
        pdf.setFontSize(9);
        subProgramLines.forEach((line) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 10;
          }
          pdf.text(line, 15, yPosition);
          yPosition += 4;
        });
      }

      pdf.save(`${manual.productName}_${manual.productNumber}.pdf`);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: `${Spacing.sm}px ${Spacing.md}px`,
    border: `1px solid ${Colors.light.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: Spacing.sm,
    fontSize: '14px',
    fontWeight: '600' as const,
  };



  if (isEditing) {
    return (
      <div>
        <div style={{ marginBottom: Spacing.xl }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>編集</h1>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              padding: `${Spacing.sm}px ${Spacing.md}px`,
              backgroundColor: Colors.light.surface,
              border: `1px solid ${Colors.light.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← 戻る
          </button>
        </div>

        <div style={{ maxWidth: '800px' }}>
          {/* 基本情報 */}
          <div style={{ marginBottom: Spacing.xl, padding: Spacing.lg, backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${Colors.light.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: Spacing.md }}>基本情報</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: Spacing.md }}>
              <div>
                <label style={labelStyle}>客先</label>
                <input type="text" name="customer" value={formData.customer} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>品名</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>品番</label>
                <input type="text" name="productNumber" value={formData.productNumber} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ファイルNo</label>
                <input type="text" name="fileNo" value={formData.fileNo} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>加工機械</label>
                <input type="text" name="machine" value={formData.machine} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>作成日</label>
                <input type="date" name="createdDate" value={formData.createdDate} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>作成者</label>
                <input type="text" name="createdBy" value={formData.createdBy} onChange={handleInputChange} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* 工程・材質情報 */}
          <div style={{ marginBottom: Spacing.xl, padding: Spacing.lg, backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${Colors.light.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: Spacing.md }}>工程・材質情報</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: Spacing.md }}>
              <div>
                <label style={labelStyle}>工程</label>
                <input type="text" name="processName" value={formData.processName} onChange={handleInputChange} placeholder="例：粗加工" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>工程（分）</label>
                <input type="text" name="processTime" value={formData.processTime} onChange={handleInputChange} placeholder="例：30" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PRG(M)</label>
                <input type="text" name="prgM" value={formData.prgM} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PRG(S)</label>
                <input type="text" name="prgS" value={formData.prgS} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>材質</label>
                <input type="text" name="material" value={formData.material} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>材寸</label>
                <input type="text" name="materialSize" value={formData.materialSize} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>処理</label>
                <input type="text" name="treatment" value={formData.treatment} onChange={handleInputChange} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* 使用工具一覧 */}
          <div style={{ marginBottom: Spacing.xl, padding: Spacing.lg, backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${Colors.light.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: Spacing.md }}>使用工具一覧</h2>
            <div style={{ marginBottom: Spacing.md }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: Spacing.sm }}>
                <div>
                  <label style={labelStyle}>T番号</label>
                  <input type="text" name="tNumber" value={newTool.tNumber} onChange={handleToolInputChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>H番号</label>
                  <input type="text" name="hNumber" value={newTool.hNumber} onChange={handleToolInputChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>使用工具</label>
                  <input type="text" name="toolName" value={newTool.toolName} onChange={handleToolInputChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>突出</label>
                  <input type="text" name="protrusion" value={newTool.protrusion} onChange={handleToolInputChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>刃長</label>
                  <input type="text" name="bladeLength" value={newTool.bladeLength} onChange={handleToolInputChange} style={inputStyle} />
                </div>
              </div>
              <button
                onClick={handleAddTool}
                style={{
                  marginTop: Spacing.md,
                  padding: `${Spacing.sm}px ${Spacing.md}px`,
                  backgroundColor: Colors.light.tint,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                工具を追加
              </button>
            </div>

            {tools.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: Colors.light.surface }}>
                      <th style={{ padding: Spacing.sm, textAlign: 'left', borderBottom: `1px solid ${Colors.light.border}` }}>T番号</th>
                      <th style={{ padding: Spacing.sm, textAlign: 'left', borderBottom: `1px solid ${Colors.light.border}` }}>H番号</th>
                      <th style={{ padding: Spacing.sm, textAlign: 'left', borderBottom: `1px solid ${Colors.light.border}` }}>使用工具</th>
                      <th style={{ padding: Spacing.sm, textAlign: 'left', borderBottom: `1px solid ${Colors.light.border}` }}>突出</th>
                      <th style={{ padding: Spacing.sm, textAlign: 'left', borderBottom: `1px solid ${Colors.light.border}` }}>刃長</th>
                      <th style={{ padding: Spacing.sm, textAlign: 'center', borderBottom: `1px solid ${Colors.light.border}` }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map(tool => (
                      <tr key={tool.id} style={{ borderBottom: `1px solid ${Colors.light.border}` }}>
                        <td style={{ padding: Spacing.sm }}>{tool.tNumber}</td>
                        <td style={{ padding: Spacing.sm }}>{tool.hNumber}</td>
                        <td style={{ padding: Spacing.sm }}>{tool.toolName}</td>
                        <td style={{ padding: Spacing.sm }}>{tool.protrusion}</td>
                        <td style={{ padding: Spacing.sm }}>{tool.bladeLength}</td>
                        <td style={{ padding: Spacing.sm, textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveTool(tool.id)}
                            style={{
                              padding: `${Spacing.xs}px ${Spacing.sm}px`,
                              backgroundColor: '#FF3B30',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 工具コメント・サブプログラムN番号 */}
          <div style={{ marginBottom: Spacing.xl, padding: Spacing.lg, backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${Colors.light.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: Spacing.md }}>工具コメント・サブプログラムN番号</h2>
            <div>
              <label style={labelStyle}>工具コメント</label>
              <textarea
                name="toolComment"
                value={formData.toolComment}
                onChange={handleInputChange}
                style={{
                  ...inputStyle,
                  minHeight: '100px',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ marginTop: Spacing.md }}>
              <label style={labelStyle}>サブプログラムN番号</label>
              <textarea
                name="subProgramNNumbers"
                value={formData.subProgramNNumbers}
                onChange={handleInputChange}
                placeholder="例：N100&#10;N200&#10;N300"
                style={{
                  ...inputStyle,
                  minHeight: '100px',
                  resize: 'vertical',
                  whiteSpace: 'pre-wrap',
                }}
              />
            </div>
          </div>

          {/* 保存ボタン */}
          <div style={{ display: 'flex', gap: Spacing.md }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: `${Spacing.md}px ${Spacing.lg}px`,
                backgroundColor: Colors.light.tint,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              保存
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                flex: 1,
                padding: `${Spacing.md}px ${Spacing.lg}px`,
                backgroundColor: Colors.light.surface,
                color: Colors.light.text,
                border: `1px solid ${Colors.light.border}`,
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: Spacing.xl }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          {manual.productName}
        </h1>
        <div style={{ display: 'flex', gap: Spacing.md }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              padding: `${Spacing.sm}px ${Spacing.md}px`,
              backgroundColor: Colors.light.surface,
              border: `1px solid ${Colors.light.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← 戻る
          </button>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: `${Spacing.sm}px ${Spacing.md}px`,
              backgroundColor: Colors.light.tint,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            編集
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            style={{
              padding: `${Spacing.sm}px ${Spacing.md}px`,
              backgroundColor: Colors.light.tint,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isGeneratingPDF ? 0.6 : 1,
            }}
          >
            {isGeneratingPDF ? 'PDF生成中...' : 'PDFダウンロード'}
          </button>
        </div>
      </div>


    </div>
  );
};

export default ManualDetailScreen;
