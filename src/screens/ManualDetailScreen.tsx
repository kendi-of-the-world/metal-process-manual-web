import React, { useState } from 'react';
import { useStorage, type WorkManual, type Tool } from '../contexts/StorageContext';
import { Colors, Spacing } from '../constants/theme';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  const handleAddTool = () => {
    if (newTool.toolName) {
      setTools([...tools, { ...newTool, id: Date.now().toString() }]);
      setNewTool({ tNumber: '', hNumber: '', toolName: '', protrusion: '', bladeLength: '' });
    }
  };

  const handleRemoveTool = (toolId: string) => {
    setTools(tools.filter(tool => tool.id !== toolId));
  };

  const handleSave = () => {
    const updatedManual: WorkManual = {
      ...formData,
      tools,
    } as WorkManual;
    updateManual(manualId, updatedManual);
    setIsEditing(false);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // 一時的なPDF設定用のHTML要素を作成
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '210mm';
      pdfContainer.style.padding = '10mm';
      pdfContainer.style.backgroundColor = '#fff';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.fontSize = '12px';
      pdfContainer.style.color = '#000';
      pdfContainer.style.lineHeight = '1.5';

      // タイトル
      const title = document.createElement('h1');
      title.textContent = '第一製造部 セットアップシート';
      title.style.textAlign = 'center';
      title.style.fontSize = '18px';
      title.style.marginBottom = '10mm';
      pdfContainer.appendChild(title);

      // 基本情報テーブル
      const table1 = document.createElement('table');
      table1.style.width = '100%';
      table1.style.borderCollapse = 'collapse';
      table1.style.marginBottom = '5mm';
      table1.innerHTML = `
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 20%">客先</td>
          <td style="border: 1px solid #000; padding: 5px; width: 30%">${manual.customer}</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 20%">ファイルNo</td>
          <td style="border: 1px solid #000; padding: 5px; width: 30%">${manual.fileNo}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">品名</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.productName}</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">CADデータ</td>
          <td style="border: 1px solid #000; padding: 5px"></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">品番</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.productNumber}</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">作成日</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.createdDate}</td>
        </tr>
      `;
      pdfContainer.appendChild(table1);

      // 工程・材質情報テーブル
      const table2 = document.createElement('table');
      table2.style.width = '100%';
      table2.style.borderCollapse = 'collapse';
      table2.style.marginBottom = '5mm';
      table2.innerHTML = `
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 20%">工程</td>
          <td style="border: 1px solid #000; padding: 5px; width: 30%">工程(${manual.processTime}分)</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 20%">材質</td>
          <td style="border: 1px solid #000; padding: 5px; width: 30%">${manual.material}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">PRG(M)</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.prgM}</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">材寸</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.materialSize}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">PRG(S)</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.prgS}</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold">処理</td>
          <td style="border: 1px solid #000; padding: 5px">${manual.treatment}</td>
        </tr>
      `;
      pdfContainer.appendChild(table2);

      // 使用工具一覧テーブル
      const table3 = document.createElement('table');
      table3.style.width = '100%';
      table3.style.borderCollapse = 'collapse';
      table3.style.marginBottom = '5mm';
      table3.innerHTML = `
        <tr style="background-color: #f0f0f0">
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 8%">N</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 8%">TNo.</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 20%">工具コメント</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 8%">T</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 8%">H</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 20%">使用工具一覧</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 10%">突出</th>
          <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 10%">Z値</th>
        </tr>
        ${tools.map((tool, index) => `
          <tr>
            <td style="border: 1px solid #000; padding: 5px; text-align: center">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center"></td>
            <td style="border: 1px solid #000; padding: 5px">${index === 0 ? manual.toolComment : ''}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center">${tool.tNumber}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center">${tool.hNumber}</td>
            <td style="border: 1px solid #000; padding: 5px">${tool.toolName}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center">${tool.protrusion}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center">${tool.bladeLength}</td>
          </tr>
        `).join('')}
      `;
      pdfContainer.appendChild(table3);

      // サブプログラムN番号
      if (manual.subProgramNNumbers) {
        const subProgramDiv = document.createElement('div');
        subProgramDiv.style.marginTop = '5mm';
        const subProgramLabel = document.createElement('p');
        subProgramLabel.textContent = 'サブプログラムN番号:';
        subProgramLabel.style.fontWeight = 'bold';
        subProgramDiv.appendChild(subProgramLabel);
        const subProgramText = document.createElement('pre');
        subProgramText.textContent = manual.subProgramNNumbers;
        subProgramText.style.fontSize = '10px';
        subProgramText.style.whiteSpace = 'pre-wrap';
        subProgramDiv.appendChild(subProgramText);
        pdfContainer.appendChild(subProgramDiv);
      }

      document.body.appendChild(pdfContainer);

      // html2canvasを使用してHTMLを画像に変換
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // jsPDFを使用して画像をPDFに変換
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4幅
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4高さ

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${manual.productName}_${manual.productNumber}.pdf`);
      document.body.removeChild(pdfContainer);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div style={{ padding: Spacing.lg }}>
      <div style={{ marginBottom: Spacing.lg, display: 'flex', gap: Spacing.md, alignItems: 'center' }}>
        <button
          onClick={() => onNavigate('home')}
          style={{
            padding: `${Spacing.sm}px ${Spacing.md}px`,
            backgroundColor: Colors.light.surface,
            color: Colors.light.text,
            border: `1px solid ${Colors.light.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ← 戻る
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          {isEditing ? '編集' : '詳細表示'}
        </h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            marginLeft: 'auto',
            padding: `${Spacing.sm}px ${Spacing.md}px`,
            backgroundColor: Colors.light.tint,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            style={{
              padding: `${Spacing.sm}px ${Spacing.md}px`,
              backgroundColor: '#34C759',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            保存
          </button>
        )}
        <button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          style={{
            padding: `${Spacing.sm}px ${Spacing.md}px`,
            backgroundColor: '#FF9500',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
            opacity: isGeneratingPDF ? 0.6 : 1,
          }}
        >
          {isGeneratingPDF ? 'PDF生成中...' : 'PDFダウンロード'}
        </button>
      </div>

      {/* 基本情報セクション */}
      <div style={{ marginBottom: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.light.surface, borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, marginBottom: Spacing.md }}>基本情報</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: Spacing.md }}>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>客先</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.customer}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>品名</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.productName}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>品番</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.productNumber}
                onChange={(e) => setFormData({ ...formData, productNumber: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.productNumber}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>ファイルNo</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.fileNo}
                onChange={(e) => setFormData({ ...formData, fileNo: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.fileNo}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>作成日</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.createdDate}
                onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.createdDate}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>作成者</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.createdBy}
                onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.createdBy}</p>
            )}
          </div>
        </div>
      </div>

      {/* 工程・材質情報セクション */}
      <div style={{ marginBottom: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.light.surface, borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, marginBottom: Spacing.md }}>工程・材質情報</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: Spacing.md }}>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>工程時間（分）</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.processTime}
                onChange={(e) => setFormData({ ...formData, processTime: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.processTime}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>PRG(M)</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.prgM}
                onChange={(e) => setFormData({ ...formData, prgM: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.prgM}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>PRG(S)</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.prgS}
                onChange={(e) => setFormData({ ...formData, prgS: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.prgS}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>材質</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.material}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>材寸</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.materialSize}
                onChange={(e) => setFormData({ ...formData, materialSize: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.materialSize}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: Spacing.sm, fontWeight: '600' }}>処理</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                style={{ width: '100%', padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{manual.treatment}</p>
            )}
          </div>
        </div>
      </div>

      {/* 工具コメント */}
      <div style={{ marginBottom: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.light.surface, borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, marginBottom: Spacing.md }}>工具コメント</h2>
        {isEditing ? (
          <textarea
            value={formData.toolComment}
            onChange={(e) => setFormData({ ...formData, toolComment: e.target.value })}
            style={{
              width: '100%',
              padding: Spacing.md,
              border: `1px solid ${Colors.light.border}`,
              borderRadius: '4px',
              minHeight: '100px',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{manual.toolComment}</p>
        )}
      </div>

      {/* 使用工具一覧 */}
      <div style={{ marginBottom: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.light.surface, borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, marginBottom: Spacing.md }}>使用工具一覧</h2>
        <div style={{ overflowX: 'auto', marginBottom: Spacing.md }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: Colors.light.background }}>
                <th style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'left' }}>T</th>
                <th style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'left' }}>H</th>
                <th style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'left' }}>工具名</th>
                <th style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'left' }}>突出</th>
                <th style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'left' }}>Z値</th>
                {isEditing && <th style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'center' }}>削除</th>}
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id}>
                  <td style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm }}>{tool.tNumber}</td>
                  <td style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm }}>{tool.hNumber}</td>
                  <td style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm }}>{tool.toolName}</td>
                  <td style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm }}>{tool.protrusion}</td>
                  <td style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm }}>{tool.bladeLength}</td>
                  {isEditing && (
                    <td style={{ border: `1px solid ${Colors.light.border}`, padding: Spacing.sm, textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveTool(tool.id)}
                        style={{
                          padding: `${Spacing.xs}px ${Spacing.sm}px`,
                          backgroundColor: '#FF3B30',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        削除
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isEditing && (
          <div style={{ padding: Spacing.md, backgroundColor: '#fff', border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, marginBottom: Spacing.md }}>工具を追加</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: Spacing.md, marginBottom: Spacing.md }}>
              <input
                type="text"
                placeholder="T"
                value={newTool.tNumber}
                onChange={(e) => setNewTool({ ...newTool, tNumber: e.target.value })}
                style={{ padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="H"
                value={newTool.hNumber}
                onChange={(e) => setNewTool({ ...newTool, hNumber: e.target.value })}
                style={{ padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="工具名"
                value={newTool.toolName}
                onChange={(e) => setNewTool({ ...newTool, toolName: e.target.value })}
                style={{ padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="突出"
                value={newTool.protrusion}
                onChange={(e) => setNewTool({ ...newTool, protrusion: e.target.value })}
                style={{ padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Z値"
                value={newTool.bladeLength}
                onChange={(e) => setNewTool({ ...newTool, bladeLength: e.target.value })}
                style={{ padding: Spacing.sm, border: `1px solid ${Colors.light.border}`, borderRadius: '4px' }}
              />
            </div>
            <button
              onClick={handleAddTool}
              style={{
                padding: `${Spacing.sm}px ${Spacing.md}px`,
                backgroundColor: Colors.light.tint,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              追加
            </button>
          </div>
        )}
      </div>

      {/* サブプログラムN番号 */}
      <div style={{ marginBottom: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.light.surface, borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, marginBottom: Spacing.md }}>サブプログラムN番号</h2>
        {isEditing ? (
          <textarea
            value={formData.subProgramNNumbers}
            onChange={(e) => setFormData({ ...formData, subProgramNNumbers: e.target.value })}
            style={{
              width: '100%',
              padding: Spacing.md,
              border: `1px solid ${Colors.light.border}`,
              borderRadius: '4px',
              minHeight: '150px',
              fontFamily: 'monospace',
            }}
          />
        ) : (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {manual.subProgramNNumbers}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ManualDetailScreen;
