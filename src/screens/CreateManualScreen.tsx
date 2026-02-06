import React, { useState } from 'react';
import { useStorage, type WorkManual, type Tool } from '../contexts/StorageContext';
import { Colors, Spacing } from '../constants/theme';

interface CreateManualScreenProps {
  onNavigate: (screen: 'home' | 'detail', manualId?: string) => void;
}

const CreateManualScreen: React.FC<CreateManualScreenProps> = ({ onNavigate }) => {
  const { addManual } = useStorage();
  const [formData, setFormData] = useState({
    customer: '',
    productName: '',
    productNumber: '',
    fileNo: '',
    machine: '',
    createdDate: new Date().toISOString().split('T')[0],
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
  });

  const [tools, setTools] = useState<Tool[]>([]);
  const [newTool, setNewTool] = useState({
    tNumber: '',
    hNumber: '',
    toolName: '',
    protrusion: '',
    bladeLength: '',
  });

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
    const manual: WorkManual = {
      id: Date.now().toString(),
      ...formData,
      tools,
      images: [],
    };
    addManual(manual);
    onNavigate('home');
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

  return (
    <div>
      <div style={{ marginBottom: Spacing.xl }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>新規作成</h1>
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
            onClick={() => onNavigate('home')}
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
};

export default CreateManualScreen;
